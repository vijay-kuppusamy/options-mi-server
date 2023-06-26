const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const LoginHistory = sequelize.define("LoginHistory", {
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: { isEmail: true },
  },
  ip: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
});

module.exports = LoginHistory;
