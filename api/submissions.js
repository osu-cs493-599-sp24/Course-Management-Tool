const { Router } = require("express");
const path = require("path");
const { Assignments } = require("../model/assignments");
const { Courses } = require("../model/courses");
const router = Router();
const { Submissions, submissionFields } = require("../model/submissions");
const auth = require("../lib/auth")
router.patch("/:submissionId", auth.requireAuthentication, async (req, res) => {
  const { submissionId } = req.params;
  const updateData = req.body;
  const { role: inputRole, user: userId } = req; 
  // Remove filePath from update data if it exists to ensure it is not changed
  if (updateData.filePath) {
    delete updateData.filePath;
  }

  try {
    // Check if the submission exists
    const submission = await Submissions.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (inputRole === "student" || !inputRole) {
      return res.status(403).json({
        message:
          "Not authorized to update assignments, student role is giving ",
      });
    }
    if (inputRole === "instructor") {
      const assignment = await Assignments.findByPk(submission.assignmentId)
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


    // Update the submission
    const updatedSubmission = await submission.update(updateData);

    // Respond with the updated submission data
    res.json(updatedSubmission);
  } catch (error) {
    console.error("Failed to update submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;