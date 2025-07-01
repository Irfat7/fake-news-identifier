const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('user', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: DataTypes.TEXT,
  email: {
    type: DataTypes.TEXT,
    unique: {
      msg: "Email already exists!"
    },
  },
  password: DataTypes.TEXT
}, {
  sequelize,
  timestamps: true,
  updatedAt: false,
});

module.exports = User;