const axios = require("axios");
const cheerio = require("cheerio");

const IndicesHistoricalData = require("../../../../models/indicesHistoricalData");

// https://www1.nseindia.com/products/dynaContent/equities/indices/historicalindices.jsp?
// indexType = NIFTY 50 & fromDate=30 - 09 - 2022 & toDate=30 - 09 - 2022

const INIT_URL =
  "https://www1.nseindia.com/products/content/equities/indices/historical_index_data.htm";

const BASE_URL =
  "https://www1.nseindia.com/products/dynaContent/equities/indices/historicalindices.jsp";

var options = {
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "text/html",
    "Content-Type": "text/html",
    "Access-Control-Allow-Origin": true,
    Referer:
      "https://www1.nseindia.com/products/content/equities/indices/historical_index_data.htm",
    Host: "www1.nseindia.com",
  },
};

const symbols = [
  "NIFTY 50",
  "NIFTY BANK",
  "NIFTY MIDCAP 50",
  "NIFTY SMLCAP 50",
];

async function initCall() {
  console.log("init starts");
  const response = await axios.get(INIT_URL);
  console.log("init response");
  console.log(response);
  return response;
}

async function makeCall(symbol, fromDate, toDate) {
  console.log("makeCall starts");
  let PARAMS =
    "?indexType=" + symbol + "&fromDate=" + fromDate + "&toDate=" + toDate;
  const response = await axios.get(BASE_URL + PARAMS, options);
  console.log("makeCall returns response");
  return response;
}

function processResponse(response) {
  const $ = cheerio.load(response);
  const historicalRecords = $("#csvContentDiv").text().split(":");
  return historicalRecords;
}

function getHistoricalObj() {
  let historicalData = {
    symbol: "",
    date: "",
    open: "",
    high: "",
    low: "",
    close: "",
    sharesTraded: "",
    turnover: "",
  };
  return historicalData;
}

function format(value, type) {
  if (value) {
    value = value.replace(/^["'](.+(?=["']$))["']$/, "$1").trim();
    if (type === "Number" && isNaN(value)) {
      return null;
    } else {
      return value;
    }
  } else {
    return "";
  }
}

function constructHistoricalData(symbol, historicalRecords) {
  let historicalDataList = [];
  for (let index = 1; index < historicalRecords.length; index++) {
    let record = historicalRecords[index];
    let data = record.split(",");
    if (data[0]) {
      let historicalData = getHistoricalObj();
      historicalData.symbol = symbol;
      historicalData.date = format(data[0], "String");
      historicalData.open = format(data[1], "String");
      historicalData.high = format(data[2], "Number");
      historicalData.low = format(data[3], "Number");
      historicalData.close = format(data[4], "Number");
      historicalData.sharesTraded = format(data[5], "Number");
      historicalData.turnover = format(data[6], "Number");
      //console.log(historicalData);
      historicalDataList.push(historicalData);
    }
  }
  console.log(historicalDataList.length);
  return historicalDataList;
}

let fields = [
  "symbol",
  "date",
  "open",
  "high",
  "low",
  "close",
  "sharesTraded",
  "turnover",
];

async function saveHistoricalData(historicalDataList) {
  //UnderlyingConfig.sync({ force: true });
  if (historicalDataList && historicalDataList.length > 0) {
    IndicesHistoricalData.bulkCreate(historicalDataList, {
      fields: fields,
      updateOnDuplicate: fields,
    });
  }
}

function processDataLoad() {
  //
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];

    makeCall(symbol, "01-09-2022", "11-10-2022")
      .then((response) => {
        let historicalRecords = processResponse(response.data);
        let historicalDataList = constructHistoricalData(
          symbol,
          historicalRecords
        );
        saveHistoricalData(historicalDataList)
          .then((response) => {
            console.log("Historical Data Saved");
          })
          .catch((error) => {
            console.log("Error in Save Historical Data", error.message);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

processDataLoad();
