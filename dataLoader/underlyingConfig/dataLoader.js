const jsonata = require("jsonata");

const UnderlyingConfig = require("../../models/underlyingConfig");
const { readFoMktLots } = require("./mktLotsLoader");
const { readQtyFreeze } = require("./qtyFreezeLoader");
const { readSosScheme } = require("./sosSchemeLoader");

function updateDataBase(mktLotsList) {
  //UnderlyingConfig.sync({ force: true });
  if (mktLotsList && mktLotsList.length > 0) {
    UnderlyingConfig.bulkCreate(mktLotsList, {
      fields: [
        "symbol",
        "underlying",
        "lotSize",
        "underlyingType",
        "qtyFrezze",
        "stepValue",
      ],
      updateOnDuplicate: ["symbol"],
    });
  }
}

function updateQtyFreeze(mktLots, qtyfreeze) {
  let mktLotsList = [];
  qtyfreeze.forEach((element) => {
    var qtyQuery = "data[symbol='" + element.SYMBOL + "']";
    const qtyExp = jsonata(qtyQuery);
    const comData = qtyExp.evaluate(mktLots);
    comData.qtyFrezze = element.VOL_FRZ_QTY;
    mktLotsList.push(comData);
  });
  return { data: mktLotsList };
}

function updateIndexSos(mktLots, symbol, stepValue) {
  var qtyQuery = "data[symbol='" + symbol + "']";
  const qtyExp = jsonata(qtyQuery);
  const comData = qtyExp.evaluate(mktLots);
  comData.stepValue = stepValue;
  return comData;
}

function updateSosScheme(mktLots, sosScheme) {
  let mktLotsList = [];
  var nifty = updateIndexSos(mktLots, "NIFTY", 50);
  mktLotsList.push(nifty);
  var banknifty = updateIndexSos(mktLots, "BANKNIFTY", 500);
  mktLotsList.push(banknifty);
  var finnifty = updateIndexSos(mktLots, "FINNIFTY", 100);
  mktLotsList.push(finnifty);
  var midnifty = updateIndexSos(mktLots, "MIDCPNIFTY", 100);
  mktLotsList.push(midnifty);
  //
  sosScheme.forEach((element) => {
    //console.log(element.Symbol, element.ApplicableStepvalue);
    const comData = updateIndexSos(
      mktLots,
      element.Symbol,
      element.ApplicableStepvalue
    );
    mktLotsList.push(comData);
  });
  return { data: mktLotsList };
}

function process() {
  try {
    var mktLots = readFoMktLots();
    var qtyfreeze = readQtyFreeze();
    var sosScheme = readSosScheme();
    var qtyUpdatedmktLots = updateQtyFreeze(mktLots, qtyfreeze);
    var sosUpdatedmktLots = updateSosScheme(qtyUpdatedmktLots, sosScheme);
    updateDataBase(sosUpdatedmktLots.data);
  } catch (error) {
    console.log(error);
  }
}

process();
