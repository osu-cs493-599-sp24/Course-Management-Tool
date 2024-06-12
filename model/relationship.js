const { Enrollments } = require("./enrollments");
const { Submissions } = require("./submissions");
const { User } = require("./users");
const { Assignments } = require("./assignments");
const { Courses } = require("./courses");



Assignments.hasMany(Submissions, { foreignKey: { allowNull: false } });
User.hasMany(Submissions, { foreignKey: { allowNull: false } });
User.hasMany(Enrollments, { foreignKey: { allowNull: false } });
Courses.hasMany(Assignments, { foreignKey: { allowNull: false } });
Courses.hasMany(Enrollments, { foreignKey: { allowNull: false } });
