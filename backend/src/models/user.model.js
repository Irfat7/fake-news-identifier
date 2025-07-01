const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('user', {
  name: DataTypes.TEXT,
  email: DataTypes.TEXT,
  password: DataTypes.TEXT
});

module.exports = User;