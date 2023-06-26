const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const UserSession = sequelize.define("UserSession", {
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  sessionId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
});

module.exports = UserSession;
