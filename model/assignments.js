const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Courses } = require("./courses");
const { Submissions } = require("./submissions");
const Assignments = sequelize.define("Assignment", {
  assignmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

// Relationship
// Assignments.hasMany(Submissions, { foreignKey: { allowNull: false } });

exports.Assignments = Assignments;

exports.assignmentFields = [
  "assignmentID",
  "title",
  "dueDate",
  "path",
  "courseID",
];
