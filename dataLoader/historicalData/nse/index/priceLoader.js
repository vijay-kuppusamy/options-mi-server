const axios = require("axios");
const jsonata = require("jsonata");

const IndexPriceDetail = require("../../../../models/indexPriceDetail");

const URL = "https://www1.nseindia.com/homepage/Indices1.json";

const symbols = [
  "NIFTY 50",
  "NIFTY BANK",
  "NIFTY MIDCAP 50",
  "NIFTY SMLCAP 50",
];

async function makeAPICall() {
  console.log("makeAPICall starts");
  const response = await axios.get(URL);
  console.log("makeAPICall response");
  return response.data;
}

function getPriceDetailObj() {
  let priceDetail = {
    symbol: "",
    lastPrice: "",
    change: "",
    pChange: "",
  };
  return priceDetail;
}

function constructPriceDetail(data) {
  let priceDetail = getPriceDetailObj();
  if (data) {
    priceDetail.symbol = data.name;
    priceDetail.lastPrice = data.lastPrice?.replace(/,/g, "");
    priceDetail.change = data.change?.replace(/,/g, "");
    priceDetail.pChange = data.pChange?.replace(/,/g, "");
  }
  return priceDetail;
}

function processResponse(response) {
  let priceDetailList = [];
  symbols.forEach((symbol) => {
    var expQuery = 'data[name="' + symbol + '"]';
    const dataExp = jsonata(expQuery);
    const data = dataExp.evaluate(response);
    let priceDetail = constructPriceDetail(data);
    priceDetailList.push(priceDetail);
  });
  return priceDetailList;
}

let fields = ["symbol", "lastPrice", "change", "pChange"];

async function saveHistoricalData(priceDetailList) {
  //IndexPriceDetail.sync({ force: true });
  if (priceDetailList && priceDetailList.length > 0) {
    IndexPriceDetail.bulkCreate(priceDetailList, {
      fields: fields,
      updateOnDuplicate: fields,
    });
  }
}

function processDataLoad() {
  makeAPICall()
    .then((response) => {
      let priceDetailList = processResponse(response);
      console.log(priceDetailList);
      saveHistoricalData(priceDetailList)
        .then((response) => {
          console.log("Price Details saved");
        })
        .catch((error) => {
          console.log("Error in save price detail", error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}

processDataLoad();
