const { Router } = require("express");
const { ValidationError } = require("sequelize");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const router = Router();
const { Submissions, submissionFields } = require("../model/submissions");
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

router.post(
  "/:assignmentid/submission",
  upload.single("file"),
  async function (req, res, next) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
    const inputUserID = 1; // Placeholder for actual user ID from authentication
    const input = {
      submissionTime: formattedDate,
      filePath: req.file.path,
      grade: req.body.grade,
      assignmentId: parseInt(req.params.assignmentid),
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
