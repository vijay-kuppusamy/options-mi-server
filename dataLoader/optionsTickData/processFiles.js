const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const IndicesIoed = require("../../models/indicesIoed");
const IndicesOptionIoed = require("../../models/indicesOptionIoed");

const dirName = "E:/HistoricalOptionsDataNiftyAndBankNifty/raw";
//const sampleFile = "E:/HistoricalOptionsDataNiftyAndBankNifty/sample.csv";

function getFiles(dirName) {
  console.log("Entering getFiles");
  var files = null;
  try {
    files = fs.readdirSync(dirName);
  } catch (error) {
    console.log(error);
  }
  console.log("Exiting getFiles");
  return files;
}

function getISODateString(dateStr) {
  let isoDateStr = "";
  if (dateStr) {
    var dateArray = dateStr.split("-");
    var yearStr = dateArray[2];
    var monthStr = dateArray[1];
    var dayStr = dateArray[0];
    isoDateStr = yearStr + "-" + monthStr + "-" + dayStr;
  }
  return isoDateStr;
}

function getIndicesIeod(row) {
  let ieod = {
    symbol: "",
    date: "",
    time: "",
    open: "",
    high: "",
    low: "",
    close: "",
  };

  if (row) {
    ieod.symbol = row[0].trim();
    //
    var dateTime = row[1].trim();
    var dateArray = dateTime.split(" ");
    var dateStr = dateArray[0];
    var timeStr = dateArray[1];
    ieod.date = getISODateString(dateStr);
    ieod.time = timeStr;
    //
    ieod.open = row[2].trim();
    ieod.high = row[3].trim();
    ieod.low = row[4].trim();
    ieod.close = row[5].trim();
  }
  return ieod;
}

function getIndicesOptionIeod(row) {
  let ieod = {
    symbol: "",
    date: "",
    time: "",
    open: "",
    high: "",
    low: "",
    close: "",
    volume: "",
    openInterest: "",
  };

  if (row) {
    var symbolStr = row[0].trim();
    if (symbolStr.startsWith("NIFTYWK")) {
      var symbol = "NIFTY";
      var strikePrice = symbolStr;
      var optionType = null;
      strikePrice = strikePrice.replace("NIFTYWK", "");
      if (symbolStr.endsWith("CE")) {
        strikePrice = strikePrice.replace("CE", "");
        optionType = "CE";
      }
      if (symbolStr.endsWith("PE")) {
        strikePrice = strikePrice.replace("PE", "");
        optionType = "PE";
      }
      ieod.symbol = symbol;
      ieod.strikePrice = strikePrice;
      ieod.optionType = optionType;
    }
    if (symbolStr.startsWith("BANKNIFTYWK")) {
      var symbol = "BANKNIFTY";
      var strikePrice = symbolStr;
      var optionType = null;
      strikePrice = strikePrice.replace("BANKNIFTYWK", "");
      if (symbolStr.endsWith("CE")) {
        strikePrice = strikePrice.replace("CE", "");
        optionType = "CE";
      }
      if (symbolStr.endsWith("PE")) {
        strikePrice = strikePrice.replace("PE", "");
        optionType = "PE";
      }
      ieod.symbol = symbol;
      ieod.strikePrice = strikePrice;
      ieod.optionType = optionType;
    }
    //
    var dateTime = row[1].trim();
    var dateArray = dateTime.split(" ");
    var dateStr = dateArray[0];
    var timeStr = dateArray[1];
    ieod.date = getISODateString(dateStr);
    ieod.time = timeStr;
    //
    ieod.open = row[2].trim();
    ieod.high = row[3].trim();
    ieod.low = row[4].trim();
    ieod.close = row[5].trim();
    ieod.volume = row[6].trim();
    ieod.openInterest = row[7].trim();
  }
  return ieod;
}

function processFile(file) {
  console.log("Entering processFile");
  var niftyRecords = [];
  var niftyOptionRecords = [];
  var bankNiftyRecords = [];
  var bankNiftyOptionRecords = [];

  if (file) {
    console.log(file);
    try {
      const records = parse(fs.readFileSync(file), {
        skip_empty_lines: true,
      });
      console.log("Record length : " + records.length);

      for (let index = 0; index < records.length; index++) {
        const row = records[index];
        //console.log(row);
        if (!(index === 1)) {
          var symbolStr = row[0];
          //
          if (symbolStr === "NIFTY") {
            var ioed = getIndicesIeod(row);
            niftyRecords.push(ioed);
          }
          //
          if (symbolStr.startsWith("NIFTYWK")) {
            var optionIoed = getIndicesOptionIeod(row);
            niftyOptionRecords.push(optionIoed);
          }
          //
          if (symbolStr === "BANKNIFTY") {
            var ioed = getIndicesIeod(row);
            bankNiftyRecords.push(ioed);
          }
          //

          if (symbolStr.startsWith("BANKNIFTYWK")) {
            var optionIoed = getIndicesOptionIeod(row);
            bankNiftyOptionRecords.push(optionIoed);
          }
          //console.log(symbol, dateTime);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  console.log("Exiting processFile");
  return [
    niftyRecords,
    niftyOptionRecords,
    bankNiftyRecords,
    bankNiftyOptionRecords,
  ];
}

async function createIndicesIoed(data) {
  try {
    let ieod = await IndicesIoed.create(data);
    console.log(ieod.id);
    return ieod;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function saveIndicesIoed(indicesIoedList) {
  console.log("Entering saveIndicesIoed");

  if (indicesIoedList && indicesIoedList.length > 0) {
    console.log(indicesIoedList.length);
    for (let index = 0; index < indicesIoedList.length; index++) {
      const element = indicesIoedList[index];
      let created = await createIndicesIoed(element);
    }
    console.log("IndicesIoed records saved");
  }
  console.log("Exiting saveIndicesIoed");
  return true;
}

async function createIndicesOptionIoed(data) {
  try {
    let ieod = await IndicesOptionIoed.create(data);
    console.log(ieod.id);
    return ieod;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function saveIndicesOptionIoed(IndicesOptionIoedList) {
  console.log("Entering saveIndicesOptionIoed");

  if (IndicesOptionIoedList && IndicesOptionIoedList.length > 0) {
    for (let index = 0; index < IndicesOptionIoedList.length; index++) {
      const element = IndicesOptionIoedList[index];
      let created = await createIndicesOptionIoed(element);
    }
    console.log("IndicesOptionIoed records saved");
  }
  console.log("Exiting saveIndicesOptionIoed");
  return true;
}

async function process() {
  console.log("Entering process");
  var files = null;
  files = getFiles(dirName);
  //console.log(files);
  //
  //let records = processFile(sampleFile);
  //
  var file = dirName + "/" + files[60];
  //console.log(file);
  let records = processFile(file);

  // console.log(records[0].length);
  // console.log(records[1].length);
  // console.log(records[2].length);
  // console.log(records[3].length);

  // IndicesIoed.sync({ force: true });
  // IndicesOptionIoed.sync({ force: true });

  let niftyResult = await saveIndicesIoed(records[0]);
  let niftyOptionsResult = await saveIndicesOptionIoed(records[1]);
  let bankNiftyResult = await saveIndicesIoed(records[2]);
  let bankNiftyOptionResult = await saveIndicesOptionIoed(records[3]);
  //
  console.log("Exiting process");
}

process();
