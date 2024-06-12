const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Courses } = require("./courses");
const { User } = require("./users");

const Enrollments = sequelize.define("Enrollments", {
  enrollmentID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
});

exports.Enrollments = Enrollments;
