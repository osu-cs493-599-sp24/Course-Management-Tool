const { DataTypes } = require("sequelize");
const sequelize = require("../lib/sequelize");
const { Enrollments } = require("./enrollments");
const { Submissions } = require("./submissions");
const bcrypt = require('bcryptjs');

const User = sequelize.define("User", {
  // Conventionally use PascalCase for model names
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Assuming userID is the primary key
    autoIncrement: true, // If userID should auto-increment
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(value, salt);
      this.setDataValue('password', hash);
    },
  }
});

User.findByEmail = async function (email) {
  return await User.findOne({ where: { email } });
};

User.prototype.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// User.hasMany(Submissions, { foreignKey: { allowNull: false } });
// User.hasMany(Enrollments, { foreignKey: { allowNull: false } });

exports.User = User; // Correcting the export to User

exports.userFields = [
  // Exporting the user fields for potential external use
  "userID",
  "firstName",
  "lastName",
  "username",
  "role",
  "email",
  "password",
];
