const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const IndicesOptionIoed = sequelize.define(
  "IndicesOptionIoed",
  {
    symbol: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    strikePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    optionType: {
      type: DataTypes.STRING(2),
      allowNull: true,
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
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    openInterest: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
  },
  {
    uniqueKeys: {
      symbol_unique: {
        fields: ["symbol", "date", "time", "strikePrice", "optionType"],
      },
    },
  }
);

module.exports = IndicesOptionIoed;
