const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Courses } = require("./courses");

const Assignments = sequelize.define("Assignment", {
  assignmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  courseID: {
    // Foreign key pointing to Courses
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Courses,
      key: "courseID",
    },
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
Assignments.belongsTo(Courses, {
  foreignKey: "courseID",
  as: "course",
  allowNull: false,
});

exports.Assignments = Assignments;
exports.assignmentFields = ["assignmentID", "title", "dueDate", "courseID"];
