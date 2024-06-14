const { Router } = require("express");
const { ValidationError } = require("sequelize");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const router = Router();
const { Submissions, submissionFields } = require("../model/submissions");
const express = require("express");
const { Assignments } = require("../model/assignments");
const auth = require("../lib/auth"); // Import the auth module
const { Courses } = require("../model/courses");
const { Enrollments } = require("../model/enrollments");
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
router.post("/", auth.requireAuthentication, async function (req, res, next) {
  try {
    const inputRole = req.role;
    const userId = req.user; // Corrected from req.userId to req.user as per your auth middleware setup
    const { courseId } = req.body; // Assuming courseId is part of the request body

    if (inputRole === "admin") {
      // Admin can create assignments for any course
      const assignment = await Assignments.create(req.body);
      return res.status(201).send({ id: assignment.assignmentID });
    } else if (inputRole === "instructor") {
      // Check if the instructor is linked to the course they're creating an assignment for
      const course = await Courses.findOne({
        where: { courseId: courseId, instructorId: userId },
      });
      if (course) {
        // Instructor is teaching this course; authorize to create assignment
        const assignment = await Assignments.create(req.body);
        return res.status(201).send({ id: assignment.assignmentID });
      } else {
        // Instructor not teaching this course; not authorized
        return res.status(403).send({
          message: "Not authorized to create assignment for this course",
        });
      }
    } else {
      // Not an admin or instructor; not authorized
      return res
        .status(403)
        .send({ message: "Not authorized to create assignments" });
    }
  } catch (e) {
    console.error("Error creating assignment:", e);
    next(e);
  }
});

// /assignments/{id} - get assignemnt by id
router.get("/:assignmentId", async function (req, res, next) {
  try {
    const { assignmentId } = req.params;

    // Validate the assignmentId, checking if it's a numeric value (assuming IDs are numeric)
    if (!assignmentId || isNaN(parseInt(assignmentId))) {
      return res
        .status(400)
        .send({ message: "Invalid or missing assignment ID" });
    }

    // Fetch the assignment using the primary key
    const assignment = await Assignments.findByPk(assignmentId);
    if (assignment) {
      // If found, send the assignment data
      res.status(200).json(assignment);
    } else {
      // If not found, return a 404 error
      res.status(404).send({ message: "Assignment not found" });
    }
  } catch (e) {
    // Log the error for debugging purposes
    console.error("Error retrieving assignment:", e);
    // Pass errors to the error-handling middleware
    next(e);
  }
});

router.patch(
  "/:assignmentId",
  auth.requireAuthentication,
  async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const updateData = req.body;
      const { courseId } = updateData; // Assuming courseId is part of updateData and should be validated
      const { role: inputRole, user: userId } = req; // Destructuring for clarity
      // Check if the assignment exists
      const assignment = await Assignments.findByPk(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      // Validate the incoming data first
      if (!updateData || Object.keys(updateData).length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid request: No update data provided" });
      }

      if (inputRole === "student" || !inputRole) {
        return res.status(403).json({
          message:
            "Not authorized to update assignments, student role is giving ",
        });
      }

      // Find course and validate instructor if not admin
      if (inputRole === "instructor") {
        const course = await Courses.findOne({
          where: { courseId: assignment.courseId, instructorId: userId },
        });
        if (!course) {
          return res.status(403).json({
            message:
              "Not authorized to update this assignment, not the instructor in this class",
          });
        }
      }

      // Check for permissible update fields
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
      res.json(updatedAssignment);
    } catch (e) {
      next(e);
    }
  }
);

// /assignment/{id} - delete assignment by id
router.delete(
  "/:assignmentId",
  auth.requireAuthentication,
  async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const { role: inputRole, user: userId } = req;
      console.log(inputRole);
      console.log(userId);
      // Optionally validate the assignmentId if needed (e.g., checking format)
      if (!assignmentId) {
        // Example check if ID is a number
        return res.status(404).json({ message: "ID not found" });
      }

      const assignment = await Assignments.findByPk(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      if (inputRole === "student" || !inputRole) {
        return res.status(403).json({
          message:
            "Not authorized to update assignments, student role is giving ",
        });
      }

      if (inputRole === "instructor") {
        const course = await Courses.findOne({
          where: { courseId: assignment.courseId, instructorId: userId },
        });
        console.log(course);
        if (!course) {
          return res.status(403).json({
            message:
              "Not authorized to update this assignment, not the instructor in this class",
          });
        }
      }

      // Check if the assignment exists
      // Delete the assignment
      await assignment.destroy();

      // Send a response indicating successful deletion
      res.status(204).send();
    } catch (e) {
      // Handle unexpected errors
      next(e);
    }
  }
);
//  .media/submissions/{filename} - download a file
router.use(
  "/media/submissions",
  express.static(path.join(__dirname, "submissions"))
);

//assignments/{id}/submissions - get submission
router.get(
  "/:assignmentId/submissions",
  auth.requireAuthentication,
  async function (req, res, next) {
    const { assignmentId } = req.params; // Extract assignmentId from params
    const { role: inputRole, user: userId } = req;
    if (!assignmentId) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    const assignment = await Assignments.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (inputRole === "student" || !inputRole) {
      return res.status(403).json({
        message:
          "Not authorized to update assignments, student role is giving ",
      });
    }

    if (inputRole === "instructor") {
      const course = await Courses.findOne({
        where: { courseId: assignment.courseId, instructorId: userId },
      });
      console.log(course);
      if (!course) {
        return res.status(403).json({
          message:
            "Not authorized to update this assignment, not the instructor in this class",
        });
      }
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
  }
);

//assignments/{id}/submissions - create a new submission
router.post(
  "/:assignmentid/submissions",
  auth.requireAuthentication,
  upload.single("file"),
  async function (req, res, next) {
        
    const inputAssignmentId = req.params.assignmentid;
    if (!inputAssignmentId) {
      return res.status(404).json({ message: "ID not given" });
    }
    const assignment = await Assignments.findByPk(inputAssignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
    const { role: inputRole, user: userId } = req;
    const downloadPath = `/assignments/media/submissions/${req.file.filename}`;
    if(inputRole == "admin" || inputRole == "instructor"){
      return res.status(403).json({
        message:
          "Not authorized to submit this assignment, not a student role",
      });
    }
    if (inputRole == "student") {
      const enrollment = await Enrollments.findOne({
        where: { courseId: assignment.courseId, userId: userId },
      });
      if (!enrollment)
        return res.status(403).json({
          message:
            "Not authorized to submit this assignment, not the student in this class",
        });
    }

    const input = {
      submissionTime: formattedDate,
      filePath: downloadPath,
      grade: req.body.grade,
      assignmentId: inputAssignmentId,
      userId: userId,
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
