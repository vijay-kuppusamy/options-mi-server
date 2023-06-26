const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const Portfolio = sequelize.define("Portfolio", {
  user: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: { isEmail: true },
  },
  underlying: {
    type: DataTypes.STRING(32),
    allowNull: false,
    validate: { isAlpha: true },
  },
  expiryDate: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  positions: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(32),
    allowNull: true,
    validate: { isAlpha: true },
  },
});

module.exports = Portfolio;
