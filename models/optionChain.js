const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const OptionChain = sequelize.define("OptionChain", {
  underlying: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    validate: { isAlpha: true },
  },
  underlyingValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { isNumeric: true },
  },
  expiryDates: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  strikePrices: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  updatedTime: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
});

module.exports = OptionChain;
