const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const UnderlyingConfig = sequelize.define("UnderlyingConfig", {
  symbol: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },
  underlying: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  underlyingType: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  lotSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  qtyFrezze: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stepValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = UnderlyingConfig;
