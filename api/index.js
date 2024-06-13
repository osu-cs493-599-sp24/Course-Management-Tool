const { Router } = require("express");

// model import
const { Enrollments } = require("../model/enrollments");
const { Submissions } = require("../model/submissions");
const { User } = require("../model/users");
const { Assignments } = require("../model/assignments");
const { Courses } = require("../model/courses");
require("../model/relationship");

// router import
const assignmentsRouter = require("./assignments");
const coursesRouter = require("./courses");
const usersRouter = require("./users");


const router = Router();

router.use("/assignments", assignmentsRouter);
router.use("/courses", coursesRouter);
router.use("/users", usersRouter);

module.exports = router;
