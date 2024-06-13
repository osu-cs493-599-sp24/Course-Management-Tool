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

User.belongsToMany(Courses, {
  through: "Enrollments",
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

Courses.belongsToMany(User, {
  through: "Enrollments",
  foreignKey: {
    name: "courseId",
    allowNull: false,
  },
});

User.hasMany(Courses, {
  foreignKey: {
    name: "instructorId",
    allowNull: false,
  },
});
