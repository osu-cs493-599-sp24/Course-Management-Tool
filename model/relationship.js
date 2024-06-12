const { Enrollments } = require("./enrollments");
const { Submissions } = require("./submissions");
const { User } = require("./users");
const { Assignments } = require("./assignments");
const { Courses } = require("./courses");

Assignments.hasMany(Submissions, {
  foreignKey: {
    name: "assignmentId",
    allowNull: false,
  },
});

User.hasMany(Submissions, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

User.hasMany(Enrollments, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

Courses.hasMany(Assignments, {
  foreignKey: {
    name: "courseId",
    allowNull: false,
  },
});

Courses.hasMany(Enrollments, {
  foreignKey: {
    name: "courseId",
    allowNull: false,
  },
});
