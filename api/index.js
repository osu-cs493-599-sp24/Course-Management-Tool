const { Router } = require("express");
const { Enrollments } = require("../model/enrollments");
const { Submissions } = require("../model/submissions");
const { User } = require("../model/users");
const { Assignments } = require("../model/assignments");
const { Courses } = require("../model/courses");
require("../model/relationship")
const router = Router();


module.exports = router;
