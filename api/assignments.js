const { Router } = require("express");
const { ValidationError } = require("sequelize");
const multer = require("multer");
const path = require("path");
const { Assignments, assignmentFields } = require("../model/assignments");
const { Submissions } = require("../model/submissions");
const { time } = require("console");
const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      const dest = path.join(__dirname, "submissions");
      console.log("== Uploading to", dest);
      callback(null, dest);
    },
    filename: (req, file, callback) => {
      const filename = crypto.psuedoRandomBytes(16);
      const extention = file.mimetype;
      console.log("Generated filename:", `$(fielname).$(extension)`);
      callback(null, `$(fielname).$(extension)`);
    },
  }),
});
router.get("/:assignmentid/submission", async function (req, res, next) {});
router.post(
  "/:assignmentid/submission",
  upload.single("file"),
  async function (req, res, next) {
    const now = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`;

    const input = {
      SubmissionsTime: now,
      filePath: req.file.path,
      grade: req.body.grade,
      assignmentid: req.params.assignmentid,
    };
    console.log("== Uploaded body: ", input);
  }
);

module.exports = router;
