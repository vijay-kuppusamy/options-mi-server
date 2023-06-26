const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const IndicesHistoricalData = sequelize.define(
  "IndicesHistoricalData",
  {
    symbol: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    open: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    high: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    low: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    close: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    sharesTraded: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    turnover: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
  },
  {
    uniqueKeys: {
      symbol_unique: {
        fields: ["symbol", "date"],
      },
    },
  }
);

module.exports = IndicesHistoricalData;
