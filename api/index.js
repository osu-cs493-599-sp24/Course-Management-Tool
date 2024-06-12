const { Router } = require("express");
const assignmentRouter = require("./assignments");

const router = Router();

router.use('/assignments', assignmentRouter)
module.exports = router;
