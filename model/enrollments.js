const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");
const { Courses } = require("./courses");
const { User } = require("./users");
const Enrollments = sequelize.define("enrolllments", {
  enrollmentID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
});

//relationship
Enrollments.belongsTo(Courses, {
  foreignKey: "courseID",
  as: "course",
  allowNull: false,
});
Enrollments.belongsTo(User, {
  foreignKey: "userID",
  as: "user",
  allowNull: false,
});

exports.EnrolllmentsFields = ["enrollments"];
exports.Enrollments = Enrollments;
