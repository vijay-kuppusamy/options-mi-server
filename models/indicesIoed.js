const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const IndicesIoed = sequelize.define(
  "IndicesIoed",
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
  },
  {
    uniqueKeys: {
      symbol_unique: {
        fields: ["symbol", "date", "time"],
      },
    },
  }
);

module.exports = IndicesIoed;
