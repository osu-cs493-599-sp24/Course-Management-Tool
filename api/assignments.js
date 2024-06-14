const { Router } = require("express");
const { ValidationError } = require("sequelize");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const router = Router();
const { Submissions, submissionFields } = require("../model/submissions");
const { off } = require("process");
const express = require("express");
const { Assignments } = require("../model/assignments");
// Setup for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      const dest = path.join(__dirname, "submissions");
      console.log("== Uploading to", dest);
      callback(null, dest);
    },
    filename: (req, file, callback) => {
      const filename = crypto.randomBytes(16).toString("hex");
      const extension = path.extname(file.originalname);
      console.log("Generated filename:", `${filename}${extension}`);
      callback(null, `${filename}${extension}`);
    },
  }),
});
// /assignments - create new assignment in the DB
router.post("/", async function (req, res, next) {
  try {
    const assignment = await Assignments.create(req.body);
    res.status(201).send({ id: assignment.assignmentID });
  } catch (e) {
    // 403 error, if user is not auth
    // 400 error, the request body was either not present or did not contain a valid assignment object

    next(e);
  }
});
// /assignments/{id} - get assignemnt by id
router.get("/:assignmentId", async function (req, res, next) {
  try {
    const { assignmentId } = req.params;

    // Check if the assignmentId is provided and valid
    if (!assignmentId) {
      return res.status(404).send({ message: "No assignment ID provided" });
    }
    const assignment = await Assignments.findByPk(assignmentId);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      res.status(404).send({ message: "Assignment not found" });
    }
  } catch (e) {
    next(e);
  }
});

router.patch("/:assignmentId", async (req, res, next) => {
  const { assignmentId } = req.params;
  const updateData = req.body;

  try {
    // Validate the incoming data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request: No update data provided" });
    }

    // Check if the assignment exists
    const assignment = await Assignments.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check for permissible update fields if necessary
    const updateFields = ["title", "dueDate", "courseId"];
    const hasValidFields = updateFields.some((field) =>
      updateData.hasOwnProperty(field)
    );
    if (!hasValidFields) {
      return res.status(400).json({
        message: "Invalid request: No valid fields provided for update",
      });
    }

    // Update the assignment
    const updatedAssignment = await assignment.update(updateData);

    // Respond with the updated assignment data
    res.json(updatedAssignment);
  } catch (e) {
    // Handle unexpected errors
    next(e);
  }
});

// /assignment/{id} - delete assignment by id
router.delete("/:assignmentId", async (req, res, next) => {
  const { assignmentId } = req.params;

  try {
    // Optionally validate the assignmentId if needed (e.g., checking format)
    if (!assignmentId) {
      // Example check if ID is a number
      return res.status(404).json({ message: "ID not found" });
    }

    // Check if the assignment exists
    const assignment = await Assignments.findByPk(assignmentId);
    // Delete the assignment
    await assignment.destroy();

    // Send a response indicating successful deletion
    res.status(204).send();
  } catch (e) {
    // Handle unexpected errors
    next(e);
  }
});
//  .media/submissions/{filename} - download a file
router.use(
  "/media/submissions",
  express.static(path.join(__dirname, "submissions"))
);

//assignments/{id}/submissions - get submission
router.get("/:assignmentId/submissions", async function (req, res, next) {
  const { assignmentId } = req.params; // Extract assignmentId from params
  if (!assignmentId) {
    return res.status(404).json({ message: "Assignment not found" });
  }
  let page = parseInt(req.query.page) || 1;
  page = page < 1 ? 1 : page;
  const numPerPage = 5;
  const offset = (page - 1) * numPerPage;

  try {
    const result = await Submissions.findAndCountAll({
      where: { assignmentId: assignmentId }, // Filter submissions by assignmentId
      limit: numPerPage,
      offset: offset,
    });
    const lastPage = Math.ceil(result.count / numPerPage);
    const links = {};

    if (page < lastPage) {
      links.nextPage = `/assignments/${assignmentId}/submissions?page=${
        page + 1
      }`;
      links.lastPage = `/assignments/${assignmentId}/submissions?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/assignments/${assignmentId}/submissions?page=${
        page - 1
      }`;
    }

    res.status(200).send({
      submissions: result.rows,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: result.count,
      links: links,
    });
  } catch (e) {
    next(e);
  }
});

//assignments/{id}/submissions - create a new submission
router.post(
  "/:assignmentid/submission",
  upload.single("file"),
  async function (req, res, next) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
    const inputUserID = 1; // Placeholder for actual user ID from authentication
    const downloadPath = `/assignments/media/submissions/${req.file.filename}`;

    const inputAssignmentId = req.params.assignmentid;
    if (!inputAssignmentId) {
      return res.status(404).json({ message: "ID not found" });
    }
    const input = {
      submissionTime: formattedDate,
      filePath: downloadPath,
      grade: req.body.grade,
      assignmentId: inputAssignmentId,
      userId: inputUserID,
    };
    console.log("== Uploaded body: ", input);
    try {
      const submission = await Submissions.create(input);
      res.status(201).send({ id: submission.submissionID });
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message });
      } else {
        next(e);
      }
    }
  }
);

module.exports = router;
