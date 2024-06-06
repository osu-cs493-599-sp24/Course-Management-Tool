const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Users } = require("./users");
const { Assignments } = require("./assignments");
const Submissions = sequelize.define("Submission", {
  submissionID: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Indicates that submissionID is a primary key
    autoIncrement: true, // Auto-increments the submissionID
    allowNull: false,
  },
  submissionTime: {
    type: DataTypes.DATE, // Stores both date and time
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Relationships
Submissions.belongsTo(Assignments, {
  foreignKey: "assignmentID",
  allowNull: false,
});
Enrollments.belongsTo(Users, {
  foreignKey: "userID",
  as: "user",
  allowNull: false,
});

exports.Submissions = Submissions;
exports.submissionFields = [
  "submissionID",
  "submissionTime",
  "filePath",
  "grade",
];
