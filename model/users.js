// model/users.js
const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');
const bcrypt = require('bcryptjs');

const User = sequelize.define("User", {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_id'
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'instructor', 'student'),
    allowNull: false,
    defaultValue: 'student'
  }
}, {
  tableName: 'users',
  underscored: true
});