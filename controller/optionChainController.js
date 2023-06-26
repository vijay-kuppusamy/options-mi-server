const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const jsonata = require("jsonata");
//
const OptionChain = require("../models/optionChain");
const OptionData = require("../models/optionData");
const { getUnderlyingConfig } = require("./underlyingConfigController");

const getOptionChain = asyncHandler(async (req, res) => {
  try {
    //console.log(req.body);
    let { underlying, expiryDate, strikes } = req.body;

    underlying = underlying ? underlying : "NIFTY";
    strikes = strikes ? strikes : 50;

    const optionChain = await OptionChain.findOne({
      where: {
        underlying: underlying,
      },
      attributes: [
        "underlying",
        "underlyingValue",
        "expiryDates",
        "strikePrices",
        "updatedTime",
      ],
    });
    var response = {};

    if (optionChain) {
      response.optionChain = optionChain;

      const underlyingConfig = await getUnderlyingConfig(underlying);

      if (underlyingConfig) {
        response.underlyingConfig = underlyingConfig;
      }

      const spotPrice = optionChain.underlyingValue;
      const stepValue = underlyingConfig.stepValue;
      const startPrice = spotPrice - (strikes / 2) * stepValue;
      const endPrice = spotPrice + (strikes / 2) * stepValue;

      expiryDate = expiryDate ? expiryDate : optionChain.expiryDates[0];
      const optionData = await OptionData.findAll({
        where: {
          underlying: underlying,
          expiryDate: expiryDate,
          strikePrice: { [Op.between]: [startPrice, endPrice] },
        },
        attributes: [
          "underlying",
          "underlyingValue",
          "expiryDate",
          "strikePrice",
          "callBidQty",
          "callBidprice",
          "callAskQty",
          "callAskPrice",
          "callIdentifier",
          "callOI",
          "callOIChg",
          "callOIChgPct",
          "callTradedVolume",
          "callIV",
          "callLastPrice",
          "callPriceChg",
          "callPriceChgPct",
          "CallBuyQty",
          "callSellQty",
          "putBidQty",
          "putBidprice",
          "putAskQty",
          "putAskPrice",
          "putIdentifier",
          "putOI",
          "putOIChg",
          "putOIChgPct",
          "putTradedVolume",
          "putIV",
          "putLastPrice",
          "putPriceChg",
          "putPriceChgPct",
          "putBuyQty",
          "putSellQty",
        ],
      });
      if (optionData) {
        response.optionData = optionData;
        response.expiryDate = expiryDate;
      }
    } else {
      res.json({ response });
    }

    //console.log(response);
    res.json({ response });
  } catch (error) {
    res.json({ error });
  }
});

const getOptionData = asyncHandler(async (req, res) => {
  try {
    //console.log("getOptionData : ", req.body);
    let { underlying, expiryDate } = req.body;

    const optionChain = await OptionChain.findOne({
      where: {
        underlying: underlying,
      },
      attributes: ["updatedTime"],
    });

    const optionData = await OptionData.findAll({
      where: {
        underlying: underlying,
        expiryDate: expiryDate,
      },
      attributes: [
        "underlying",
        "underlyingValue",
        "expiryDate",
        "strikePrice",
        "callBidQty",
        "callBidprice",
        "callAskQty",
        "callAskPrice",
        "callIdentifier",
        "callOI",
        "callOIChg",
        "callOIChgPct",
        "callTradedVolume",
        "callIV",
        "callLastPrice",
        "callPriceChg",
        "callPriceChgPct",
        "CallBuyQty",
        "callSellQty",
        "putBidQty",
        "putBidprice",
        "putAskQty",
        "putAskPrice",
        "putIdentifier",
        "putOI",
        "putOIChg",
        "putOIChgPct",
        "putTradedVolume",
        "putIV",
        "putLastPrice",
        "putPriceChg",
        "putPriceChgPct",
        "putBuyQty",
        "putSellQty",
      ],
    });
    var response = { expiryDate, optionChain: "", optionData: "" };
    if (optionData) {
      response.optionChain = optionChain;
    }
    if (optionData) {
      response.optionData = optionData;
    }
    res.json({ response });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = {
  getOptionChain,
  getOptionData,
};
