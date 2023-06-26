const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const OptionData = sequelize.define(
  "OptionData",
  {
    underlying: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: { isAlpha: true },
    },
    expiryDate: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: { isAlpha: true },
    },
    strikePrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isNumeric: true },
    },
    underlyingValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { isNumeric: true },
    },
    callBidQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callBidprice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callAskQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callAskPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callIdentifier: {
      type: DataTypes.STRING(64),
      allowNull: true,
      validate: { is: /[a-zA-Z0-9-.]*$/i },
    },
    callOI: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callOIChg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callOIChgPct: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callTradedVolume: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callIV: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callLastPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callPriceChg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callPriceChgPct: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    CallBuyQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    callSellQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putBidQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putBidprice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putAskQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putAskPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putIdentifier: {
      type: DataTypes.STRING(64),
      allowNull: true,
      validate: { is: /[a-zA-Z0-9-.]*$/i },
    },
    putOI: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putOIChg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putOIChgPct: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putTradedVolume: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putIV: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putLastPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putPriceChg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putPriceChgPct: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putBuyQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
    putSellQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { isNumeric: true },
    },
  },
  {
    uniqueKeys: {
      option_unique: {
        fields: ["underlying", "expiryDate", "strikePrice"],
      },
    },
  }
);

module.exports = OptionData;
