const { User } = require("./model/users");
const { Assignments } = require("./model/assignments");
const { Courses } = require("./model/courses");
require("./model/relationship");

const assignmentData = require("./data/Assignments.json");
const coursesData = require("./data/Courses.json");
const usersData = require("./data/Users.json");

const sequelize = require("./lib/sequelize");

// Correct usage of sequelize.sync()
sequelize.sync().then(async function () {
//   await Courses.bulkCreate(coursesData);
//   await User.bulkCreate(usersData);
  await Assignments.bulkCreate(assignmentData);
}).catch(error => {
  console.error('Error during database synchronization:', error);
});
