const { Router } = require("express");
const path = require("path");
const router = Router();
const { Submissions, submissionFields } = require("../model/submissions");

router.patch("/:submissionId", async (req, res) => {
  const { submissionId } = req.params;
  const updateData = req.body;

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
