const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const IndexPriceDetail = sequelize.define("IndexPriceDetail", {
  symbol: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
  },
  lastPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { isNumeric: true },
  },
  change: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { isNumeric: true },
  },
  pChange: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { isNumeric: true },
  },
});

module.exports = IndexPriceDetail;
