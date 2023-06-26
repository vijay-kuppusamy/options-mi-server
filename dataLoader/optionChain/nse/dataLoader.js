const axios = require("axios");

const OptionChain = require("../../../models/optionChain");
const OptionData = require("../../../models/optionData");

const BASE_URL = "https://www.nseindia.com/api";
const INDICES_PATH = "/option-chain-indices?symbol=";

var options = {
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": true,
    Referer: "https://www.nseindia.com/option-chain",
    Host: "www.nseindia.com",
  },
};

const symbols = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];

async function makeAPICall(symbol) {
  console.log("makeAPICall starts");
  const response = await axios.get(BASE_URL + INDICES_PATH + symbol, options);
  console.log("makeAPICall returns response");
  return response;
}

function getOptionChain(underlying, response) {
  let optionChain = {
    underlying: "",
    underlyingValue: 0,
    expiryDates: {},
    strikePrices: {},
    updatedTime: "",
  };
  if (response) {
    optionChain.underlying = underlying;
    optionChain.underlyingValue = response.records.underlyingValue;
    optionChain.expiryDates = response.records.expiryDates;
    optionChain.strikePrices = response.records.strikePrices;
    optionChain.updatedTime = response.records.timestamp;
  }
  return optionChain;
}

async function saveOptionChain(optionChain) {
  try {
    const data = await OptionChain.findOne({
      where: {
        underlying: optionChain.underlying,
      },
    });
    if (data) {
      data.underlyingValue = optionChain.underlyingValue;
      data.expiryDates = optionChain.expiryDates;
      data.strikePrices = optionChain.strikePrices;
      data.updatedTime = optionChain.updatedTime;
      const id = await data.save();
      console.log("Option Chain Updated");
      return data;
    } else {
      const newOptionChain = await OptionChain.create(optionChain);
      const id = await newOptionChain.id;
      console.log("Option Chain Created");
      return newOptionChain;
    }
  } catch (error) {
    console.log(error);
  }
}

function hasValue(value) {
  return value ? value : 0;
}

function getOptionData(optionChain, data) {
  let optionData = {
    underlying: "",
    expiryDate: "",
    strikePrice: 0,
    underlyingValue: 0,
    callBidQty: 0,
    callBidprice: 0,
    callAskQty: 0,
    callAskPrice: 0,
    callIdentifier: "",
    callOI: 0,
    callOIChg: 0,
    callOIChgPct: 0,
    callTradedVolume: 0,
    callIV: 0,
    callLastPrice: 0,
    callPriceChg: 0,
    callPriceChgPct: 0,
    CallBuyQty: 0,
    callSellQty: 0,
    putBidQty: 0,
    putBidprice: 0,
    putAskQty: 0,
    putAskPrice: 0,
    putIdentifier: "",
    putOI: 0,
    putOIChg: 0,
    putOIChgPct: 0,
    putTradedVolume: 0,
    putIV: 0,
    putLastPrice: 0,
    putPriceChg: 0,
    putPriceChgPct: 0,
    putBuyQty: 0,
    putSellQty: 0,
  };

  if (data) {
    optionData.underlying = optionChain.underlying;
    optionData.underlyingValue = optionChain.underlyingValue;
    optionData.expiryDate = data.expiryDate;
    optionData.strikePrice = data.strikePrice;
    if (data.CE) {
      optionData.callIdentifier = data.CE?.identifier;
      optionData.callOI = hasValue(data.CE?.openInterest);
      optionData.callOIChg = hasValue(data.CE?.changeinOpenInterest);
      optionData.callOIChgPct = hasValue(data.CE?.pchangeinOpenInterest);
      optionData.callTradedVolume = hasValue(data.CE?.totalTradedVolume);
      optionData.callLastPrice = hasValue(data.CE?.lastPrice);
      optionData.callPriceChg = hasValue(data.CE?.change);
      optionData.callPriceChgPct = hasValue(data.CE?.pChange);
      optionData.CallBuyQty = hasValue(data.CE?.totalBuyQuantity);
      optionData.callSellQty = hasValue(data.CE?.totalSellQuantity);
      optionData.callBidQty = hasValue(data.CE?.bidQty);
      optionData.callBidprice = hasValue(data.CE?.bidprice);
      optionData.callAskQty = hasValue(data.CE?.askQty);
      optionData.callAskPrice = hasValue(data.CE?.askPrice);
      optionData.callIV = hasValue(data.CE?.impliedVolatility);
    }
    if (data.PE) {
      optionData.putIdentifier = data.PE?.identifier;
      optionData.putOI = hasValue(data.PE?.openInterest);
      optionData.putOIChg = hasValue(data.PE?.changeinOpenInterest);
      optionData.putOIChgPct = hasValue(data.PE?.pchangeinOpenInterest);
      optionData.putTradedVolume = hasValue(data.PE?.totalTradedVolume);
      optionData.putLastPrice = hasValue(data.PE?.lastPrice);
      optionData.putPriceChg = hasValue(data.PE?.change);
      optionData.putPriceChgPct = hasValue(data.PE?.pChange);
      optionData.putBuyQty = hasValue(data.PE?.totalBuyQuantity);
      optionData.putSellQty = hasValue(data.PE?.totalSellQuantity);
      optionData.putBidQty = hasValue(data.PE?.bidQty);
      optionData.putBidprice = hasValue(data.PE?.bidprice);
      optionData.putAskQty = hasValue(data.PE?.askQty);
      optionData.putAskPrice = hasValue(data.PE?.askPrice);
      optionData.putIV = hasValue(data.PE?.impliedVolatility);
    }
  }

  return optionData;
}

const fields = [
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
];

async function saveOptionData(optionDataList) {
  if (optionDataList && optionDataList.length > 0) {
    OptionData.bulkCreate(optionDataList, {
      fields: fields,
      updateOnDuplicate: fields,
    });
  }
}

function process() {
  const underlying = symbols[0];
  //const underlying = symbols[1];

  makeAPICall(underlying)
    .then((response) => {
      console.log("sucess response!");
      console.log("Getting Option Chain");
      const optionChain = getOptionChain(underlying, response.data);
      //console.log(optionChain);
      const optionData = response.data.records.data;
      console.log(optionData.length);
      let optionDataList = [];
      console.log("Getting Option Data");
      optionData.forEach((element) => {
        oData = getOptionData(optionChain, element);
        optionDataList.push(oData);
      });
      console.log(optionDataList.length);
      saveOptionChain(optionChain)
        .then((data) => {
          console.log("Option Chain saved");
          saveOptionData(optionDataList)
            .then(() => {
              console.log("Option Data Saved");
              console.log("Data load complete");
            })
            .catch((error) => {
              console.log("Error in save option data");
              console.log(error);
            });
        })
        .catch((error) => {
          console.log("Error on create Option Chain");
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}

process();
