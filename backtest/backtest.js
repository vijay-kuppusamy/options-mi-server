const fs = require("fs");
const jsonata = require("jsonata");
const { Parser } = require("json2csv");

const IndicesIoed = require("../models/indicesIoed");
const IndicesOptionIoed = require("../models/indicesOptionIoed");

function incrementMinute(time) {
  //
  let minutes = parseInt(time.split(":")[1]);
  let hours = parseInt(time.split(":")[0]);
  //
  minutes += 1;
  if (minutes == 60) {
    minutes = 0;
    hours += 1;
  }
  let strMin = minutes;
  let strhour = hours;
  if (minutes < 10) strMin = "0" + minutes;
  if (hours < 10) strhour = "0" + hours;
  return strhour + ":" + strMin + ":00";
}

function getNearestStrike(spotPrice, stepValue) {
  console.log(spotPrice, stepValue);
  return Math.round(spotPrice / stepValue) * stepValue;
}

function getStrikesByStrategy(spotPrice, order) {
  console.log("getStrikesByStrategy");
  //console.log(spotPrice, order);
  let strike = getNearestStrike(spotPrice, order.stepValue);
  console.log(strike);
  if (order.strategy === "straddle") {
    return [strike, strike];
  }
  if (order.strategy === "strangle") {
    return [strike + order.strangleWidth, strike - order.strangleWidth];
  }
}

function getPosition() {
  let position = {
    optionType: "",
    transactionType: "",
    strikePrice: "",
    status: "",
    stoplossHit: "",
    entrtyPrice: "",
    exitPrice: "",
    trailPrice: 0,
    pl: "",
  };
  return position;
}

function getPositionsByStrategy(spotPrice, order) {
  let strike = getNearestStrike(spotPrice, order.stepValue);
  if (order.strategy === "strangle") {
    //
    let position1 = getPosition();
    position1.strikePrice = parseInt(strike) + parseInt(order.strangleWidth);
    position1.optionType = "CE";
    position1.transactionType = "Sell";
    //
    let position2 = getPosition();
    position2.strikePrice = parseInt(strike) - parseInt(order.strangleWidth);
    position2.optionType = "PE";
    position2.transactionType = "Sell";
    //
    return [position1, position2];
  }
  return [];
}

function getPriceAtTime(ioed, time) {
  console.log(time);
  const ioedJson = { data: ioed };
  var query = "data[time='" + time + "']";
  const exp = jsonata(query);
  const result = exp.evaluate(ioedJson);
  if (result) {
    return result.open;
  } else {
    return null;
  }
}

function calculatePL(buyPrice, sellprice, type) {
  if (type === "Buy") {
    return sellprice - buyPrice;
  }
  if (type === "Sell") {
    return buyPrice - sellprice;
  }
}

async function getUnderlyingIoed(symbol, date) {
  try {
    const indexIoed = await IndicesIoed.findAll({
      order: [["time", "ASC"]],
      where: {
        symbol: symbol,
        date: date,
      },
      attributes: ["time", "open"],
      raw: true,
    });
    return indexIoed;
  } catch (error) {
    console.log(error);
  }
  return {};
}

async function getStrikeIoed(symbol, date, strikePrice, optionType) {
  try {
    //console.log(symbol, date, strikePrice, optionType);
    const strikeIoed = await IndicesOptionIoed.findAll({
      order: [["time", "ASC"]],
      where: {
        symbol: symbol,
        date: date,
        strikePrice: strikePrice,
        optionType: optionType,
      },
      attributes: ["time", "open"],
      raw: true,
    });
    return strikeIoed;
  } catch (error) {
    console.log(error);
  }
  return {};
}

/**
 Adjestment 1
 Stoploss - 30% for each position
 Trailing stoploss - 20% if one position hits stoploss
 */
async function backtestByAdj1(order) {
  console.log("backtestByAdj1 starts");
  try {
    //console.log(order);
    const indexIoed = await getUnderlyingIoed(order.symbol, order.date);
    console.log("Retrived Index IOED");
    if (indexIoed && indexIoed.length > 0) {
      //console.log(indexIoed.length);

      let indexPriceAtBuyTime = getPriceAtTime(indexIoed, order.buyTime);
      //console.log(priceAtBuyTime);
      //
      let positions = getPositionsByStrategy(indexPriceAtBuyTime, order);
      order.positions = positions;
      //console.log(order);
      //
      const position1Ioed = await getStrikeIoed(
        order.symbol,
        order.date,
        positions[0].strikePrice,
        positions[0].optionType
      );
      //console.log(position1Ioed);
      let position1BuyPrice = getPriceAtTime(position1Ioed, order.buyTime);
      //console.log(position1BuyPrice);
      order.positions[0].entrtyPrice = position1BuyPrice;
      order.positions[0].status = "Open";
      //
      const position2Ioed = await getStrikeIoed(
        order.symbol,
        order.date,
        positions[1].strikePrice,
        positions[1].optionType
      );
      //console.log(position2Ioed);
      let position2BuyPrice = getPriceAtTime(position2Ioed, order.buyTime);
      //console.log(position2BuyPrice);
      order.positions[1].entrtyPrice = position2BuyPrice;
      order.positions[1].status = "Open";
      //
      let time = order.buyTime;
      let endTime = incrementMinute(order.sellTime);
      let reached = false;
      //
      let plArray = [];
      while (!reached) {
        //
        let out = {};
        out.Time = time;
        out.UnderlyingAtBuy = indexPriceAtBuyTime;
        //
        let indexPriceAtTime = getPriceAtTime(indexIoed, time);
        let underlyingChg =
          parseInt(indexPriceAtBuyTime) - parseInt(indexPriceAtTime);
        let underlyingChgPct = (
          (100 * underlyingChg) /
          indexPriceAtBuyTime
        ).toFixed(2);
        //
        out.UnderlyingCurrent = indexPriceAtTime;
        out.UnderlyingChg = underlyingChg;
        out.UnderlyingChgPct = underlyingChgPct;
        //
        if (order.positions[0].status === "Open") {
          let position1PriceAtTime = getPriceAtTime(position1Ioed, time);
          const position1Pl = calculatePL(
            order.positions[0].entrtyPrice,
            position1PriceAtTime,
            "Sell"
          );
          let position1PLAmt = (position1Pl * order.lotSize).toFixed(2);
          let position1PLPct = (
            (100 * position1Pl) /
            position1PriceAtTime
          ).toFixed(2);
          //
          order.positions[0].pl = position1Pl;
          //
          out.position1PL = position1Pl;
          out.position1PLAmt = position1PLAmt;
          out.position1PLPct = position1PLPct;
          //
          if (order.trailStoploss) {
            if (order.positions[0].trailPrice <= 0) {
              order.positions[0].trailPrice = position1PriceAtTime;
            } else {
              let type = order.positions[0].transactionType;
              let trailPrice = order.positions[0].trailPrice;
              let price = position1PriceAtTime;

              if (type === "Sell" && price < trailPrice) {
                order.positions[0].trailPrice = price;
              }
              let trailPriceChg = 0;
              let trailPriceChgPct = 0;

              if (type === "Sell") {
                trailPriceChg = trailPrice - price;
              }

              trailPriceChgPct = (100 * trailPriceChg) / trailPrice;
              if (
                trailPriceChgPct < 0 &&
                Math.abs(trailPriceChgPct) > order.trailingStoploss
              ) {
                order.positions[0].status = "Closed";
                order.positions[0].stoplossHit = true;
                order.positions[0].exitPrice = position1PriceAtTime;
                order.positions[0].pl = position1Pl;
              }
            }
          }
          //
          if (position1PLPct < 0 && Math.abs(position1PLPct) > order.stoploss) {
            order.stoplossHit = true;
            order.trailStoploss = true;
            order.positions[0].status = "Closed";
            order.positions[0].stoplossHit = true;
            order.positions[0].exitPrice = position1PriceAtTime;
            order.positions[0].pl = position1Pl;
          }
        }

        //
        if (order.positions[1].status === "Open") {
          let position2PriceAtTime = getPriceAtTime(position2Ioed, time);
          const position2Pl = calculatePL(
            order.positions[1].entrtyPrice,
            position2PriceAtTime,
            "Sell"
          );
          let position2PLAmt = (position2Pl * order.lotSize).toFixed(2);
          let position2PLPct = (
            (100 * position2Pl) /
            position2PriceAtTime
          ).toFixed(2);
          //
          order.positions[1].pl = position2Pl;
          //
          out.position2PL = position2Pl;
          out.position2PLAmt = position2PLAmt;
          out.position2PLPct = position2PLPct;
          //
          if (order.trailStoploss) {
            if (order.positions[1].trailPrice <= 0) {
              order.positions[1].trailPrice = position2PriceAtTime;
              //
              //console.log(time, order.positions[1].trailPrice);
            } else {
              let type = order.positions[1].transactionType;
              let trailPrice = order.positions[1].trailPrice;
              let price = position2PriceAtTime;

              if (type === "Sell" && price < trailPrice) {
                order.positions[1].trailPrice = price;
              }
              let trailPriceChg = 0;
              let trailPriceChgPct = 0;

              if (type === "Sell") {
                trailPriceChg = trailPrice - price;
              }

              trailPriceChgPct = (100 * trailPriceChg) / trailPrice;

              if (
                trailPriceChgPct < 0 &&
                Math.abs(trailPriceChgPct) > order.trailingStoploss
              ) {
                order.positions[1].status = "Closed";
                order.positions[1].stoplossHit = true;
                order.positions[1].exitPrice = position2PriceAtTime;
                order.positions[1].pl = position2Pl;
              }
            }
          }
          //
          if (position2PLPct < 0 && Math.abs(position2PLPct) > order.stoploss) {
            order.stoplossHit = true;
            order.trailStoploss = true;
            order.positions[1].status = "Closed";
            order.positions[1].stoplossHit = true;
            order.positions[1].exitPrice = position2PriceAtTime;
            order.positions[1].pl = position2Pl;
          }
        }

        //
        let pl = (
          (order.positions[0].pl + order.positions[1].pl) *
          order.lotSize
        ).toFixed(2);
        out.PL = pl;
        //
        plArray.push(out);
        //
        time = incrementMinute(time);
        if (time === endTime) reached = true;
      }
      //
      console.log(order);
      //
      const fields = [
        "Time",
        "UnderlyingAtBuy",
        "UnderlyingCurrent",
        "UnderlyingChg",
        "UnderlyingChgPct",
        "position1PL",
        "position1PLAmt",
        "position1PLPct",
        "position2PL",
        "position2PLAmt",
        "position2PLPct",
        "PL",
      ];
      const opts = { fields };

      try {
        const parser = new Parser(opts);
        const csv = parser.parse(plArray);
        //console.log(csv);
        fs.writeFile(
          "./backtestresults/" +
            order.symbol +
            "-" +
            order.strategy +
            "-" +
            order.date +
            "-Adj1.csv",
          csv,
          (err) => {
            console.log(err || "done");
          }
        );
      } catch (err) {
        console.error(err);
      }
      //
    } else {
      console.log("No data for Index IOED");
    }
  } catch (error) {
    console.log(error);
  }
  console.log("backtestByAdj1 ends");
}

//
async function backtestByMinute(order) {
  console.log("backtestByMinute starts");
  try {
    const indexIoed = await getUnderlyingIoed(order.symbol, order.date);
    console.log("Retrived Index IOED");
    if (indexIoed && indexIoed.length > 0) {
      //console.log(indexIoed);
      let priceAtBuyTime = getPriceAtTime(indexIoed, order.buyTime);
      //
      let strikes = getStrikesByStrategy(priceAtBuyTime, order);
      //console.log("Strikes : " + strikes);
      let callStrike = strikes[0];
      let putStrike = strikes[1];
      //
      //
      const strikeIoedCE = await getStrikeIoed(
        order.symbol,
        order.date,
        callStrike,
        "CE"
      );
      //console.log(strikeIoedCE);
      let callPriceAtBuyTime = getPriceAtTime(strikeIoedCE, order.buyTime);

      //
      const strikeIoedPE = await getStrikeIoed(
        order.symbol,
        order.date,
        putStrike,
        "PE"
      );
      let putPriceAtBuyTime = getPriceAtTime(strikeIoedPE, order.buyTime);

      //
      let time = order.buyTime;
      let endTime = incrementMinute(order.sellTime);
      let reached = false;
      //
      let plArray = [];
      while (!reached) {
        //
        let priceAtSellTime = getPriceAtTime(indexIoed, time);
        //
        let callPriceAtSellTime = getPriceAtTime(strikeIoedCE, time);
        const callPl = calculatePL(
          callPriceAtBuyTime,
          callPriceAtSellTime,
          "Sell"
        );
        //
        let putPriceAtSellTime = getPriceAtTime(strikeIoedPE, time);
        const putPl = calculatePL(
          putPriceAtBuyTime,
          putPriceAtSellTime,
          "Sell"
        );
        //
        let pl = ((callPl + putPl) * order.lotSize).toFixed(2);
        //
        let callPLAmount = (callPl * order.lotSize).toFixed(2);
        let callPLPercentage = ((100 * callPl) / callPriceAtBuyTime).toFixed(2);
        //
        let putPLAmount = (putPl * order.lotSize).toFixed(2);
        let putPLPercentage = (
          (100 * putPl) /
          parseInt(putPriceAtBuyTime)
        ).toFixed(2);
        //
        let underlyingChange = priceAtBuyTime - priceAtSellTime;
        let underlyingChgPct = (
          (100 * underlyingChange) /
          priceAtBuyTime
        ).toFixed(2);
        //
        let out = {};
        out.Time = time;
        out.CallBuyPrice = callPriceAtBuyTime;
        out.CallCurrentPrice = callPriceAtSellTime;
        out.CallPL = callPl.toFixed(2);
        out.CallPLAmount = callPLAmount;
        out.CallPLPercentage = callPLPercentage;
        out.PutBuyPrice = putPriceAtBuyTime;
        out.PutCurrentPrice = putPriceAtSellTime;
        out.PutPL = putPl.toFixed(2);
        out.PutPLAmount = putPLAmount;
        out.PutPLPercentage = putPLPercentage;
        out.PL = pl;
        out.UnderlyingAtBuy = priceAtBuyTime;
        out.UnderlyingCurrent = priceAtSellTime;
        out.UnderlyingChange = underlyingChange;
        out.UnderlyingChgPct = underlyingChgPct;

        plArray.push(out);
        //
        time = incrementMinute(time);
        if (time === endTime) reached = true;
      }
      //console.table(plArray);
      //
      const fields = [
        "Time",
        "UnderlyingAtBuy",
        "UnderlyingCurrent",
        "UnderlyingChange",
        "UnderlyingChgPct",
        "CallPL",
        "CallPLAmount",
        "CallPLPercentage",
        "PutPL",
        "PutPLAmount",
        "PutPLPercentage",
        "PL",
      ];
      const opts = { fields };

      try {
        const parser = new Parser(opts);
        const csv = parser.parse(plArray);
        //console.log(csv);
        fs.writeFile(
          "./backtestresults/" +
            order.symbol +
            "-" +
            order.strategy +
            "-" +
            order.date +
            ".csv",
          csv,
          (err) => {
            console.log(err || "done");
          }
        );
      } catch (err) {
        console.error(err);
      }

      //
    } else {
      console.log("No data for Index IOED");
    }
  } catch (error) {
    console.log(error);
  }
  console.log("backtestByMinute ends");
}
//
async function backtestByDate(date, order) {
  console.log("backtestByDate starts");
  try {
    const indexIoed = await getUnderlyingIoed(order.symbol, date);
    console.log("Retrived Index IOED");
    if (indexIoed && indexIoed.length > 0) {
      //console.log(indexIoed);
      let priceAtBuyTime = getPriceAtTime(indexIoed, order.buyTime);
      //
      let strikes = getStrikesByStrategy(priceAtBuyTime, order);
      console.log("Strikes : " + strikes);
      let callStrike = strikes[0];
      let putStrike = strikes[1];
      //
      const strikeIoedCE = await getStrikeIoed(
        order.symbol,
        date,
        callStrike,
        "CE"
      );
      //console.log(strikeIoedCE);
      let callPriceAtBuyTime = getPriceAtTime(strikeIoedCE, buyTime);
      let callPriceAtSellTime = getPriceAtTime(strikeIoedCE, sellTime);
      //   console.log(callPriceAtBuyTime);
      //   console.log(callPriceAtSellTime);
      const callPl = calculatePL(
        callPriceAtBuyTime,
        callPriceAtSellTime,
        "Sell"
      );
      //console.log(callPl);
      //
      const strikeIoedPE = await getStrikeIoed(
        order.symbol,
        date,
        putStrike,
        "PE"
      );
      let putPriceAtBuyTime = getPriceAtTime(strikeIoedPE, buyTime);
      let putPriceAtSellTime = getPriceAtTime(strikeIoedPE, sellTime);
      //   console.log(putPriceAtBuyTime);
      //   console.log(putPriceAtSellTime);
      const putPl = calculatePL(putPriceAtBuyTime, putPriceAtSellTime, "Sell");
      //console.log(putPl);
      //
      let pl = ((callPl + putPl) * order.lotSize).toFixed(2);
      //console.log("Profit / Loss : " + pl);

      let result = {};
      result.symbol = order.symbol;
      result.date = date;
      result.entryTime = order.buyTime;
      result.exitTime = order.sellTime;
      result.strategy = order.strategy;
      result.callStrike = callStrike;
      result.putStrike = putStrike;
      result.pl = pl;
      //console.log(result);
      //
      console.log("backtestByDate ends");
      return result;
    } else {
      console.log("No data for Index IOED");
    }
  } catch (error) {
    console.log(error);
  }
  console.log("backtestByDate ends");
  return {};
}

async function backtestByMonth(order) {
  console.log("backtestByMonth starts");
  try {
    //
    const dString = order.date;
    const days = order.days;
    let [year, month, day] = dString.split("-");
    // month - 1 as month in the Date constructor is zero indexed
    const now = new Date(year, month - 1, day);
    let loopDay = now;
    //
    let resultArray = [];
    for (let i = 0; i <= days; i++) {
      loopDay.setDate(loopDay.getDate() + 1);
      let date = loopDay.toISOString().split("T")[0];
      let result = await backtestByDate(date, order);
      resultArray.push(result);
    }
    //
    const fields = [
      "symbol",
      "date",
      "entryTime",
      "exitTime",
      "strategy",
      "callStrike",
      "putStrike",
      "pl",
    ];
    const opts = { fields };

    try {
      const parser = new Parser(opts);
      const csv = parser.parse(resultArray);
      //console.log(csv);
      fs.writeFile(
        "./backtestresults/" +
          order.symbol +
          "-" +
          order.strategy +
          "-" +
          order.date +
          "-" +
          days +
          "-days.csv",
        csv,
        (err) => {
          console.log(err || "done");
        }
      );
    } catch (err) {
      console.error(err);
    }
    //
  } catch (error) {
    console.log(error);
  }
  console.log("backtestByMonth ends");
}

/**
  Adjestment 1
  Stoploss - 30% for each position
  Trailing stoploss - 20% if one position hits stoploss
 */
// let order = {
//   symbol: "NIFTY",
//   lotSize: 50,
//   stepValue: 100,
//   date: "2021-02-01",
//   days: 30,
//   buyTime: "09:55:00",
//   sellTime: "15:00:00",
//   strategy: "strangle",
//   strangleWidth: 300,
//   stoploss: 30,
//   stoplossHit: false,
//   trailingStoploss: 20,
//   trailStoploss: false,
//   pl: "",
//   positions: [],
// };

function getOrder(date, buyTime, sellTime, strategy) {
  let order = {
    symbol: "NIFTY",
    lotSize: 50,
    stepValue: 100,
    date: date,
    days: 30,
    buyTime: buyTime,
    sellTime: sellTime,
    strategy: strategy,
    strangleWidth: 300,
    stoploss: 30,
    stoplossHit: false,
    trailingStoploss: 20,
    trailStoploss: false,
    pl: "",
    positions: [],
  };
  return order;
}

// Date Format - YYYY-MM-DD
//let date = "2021-02-01";
//let date = "2021-02-26";
let date = "2021-03-03";
//let date = "2021-03-12";
//let date = "2021-03-30";

let buyTime = "09:55:00";
let sellTime = "15:00:00";
let strategy = "strangle";

async function backtest() {
  let order = getOrder(date, buyTime, sellTime, strategy);
  //let result = await backtestByDate(date, order);
  //console.log(result);
  //backtestByMinute(order);
  //backtestByMonth(order);
  backtestByAdj1(order);
}

backtest();
