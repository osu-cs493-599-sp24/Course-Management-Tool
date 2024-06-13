const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Assignments } = require("./assignments");
const { Enrollments } = require("./enrollments");
const Courses = sequelize.define("Courses", {
  // Use PascalCase for model names
  courseID: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Assuming courseID is a primary key
    autoIncrement: true,
    allowNull: false,
  },
  subjectCode: {
    type: DataTypes.STRING, // Typically subject codes are strings (e.g., "MATH", "ENG"), adjust if necessary
    allowNull: false,
  },
  courseNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

exports.Courses = Courses;

// Courses.hasMany(Assignments, { foreignKey: { allowNull: false } });
// Courses.hasMany(Enrollments, { foreignKey: { allowNull: false } });

exports.CoursesFields = [
  // Renaming for better clarity and grammar
  "courseID",
  "subjectCode",
  "courseNumber",
  "title",
  "instructor",
];
