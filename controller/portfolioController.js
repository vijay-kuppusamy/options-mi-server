const asyncHandler = require("express-async-handler");

const Portfolio = require("../models/portfolio");
const OptionData = require("../models/optionData");

async function getPositionPrice(position) {
  try {
    const optionData = await OptionData.findOne({
      where: {
        underlying: position.symbol,
        expiryDate: position.expiryDate,
        strikePrice: position.strikePrice,
      },
      attributes: [
        "underlying",
        "underlyingValue",
        "expiryDate",
        "strikePrice",
        "callLastPrice",
        "callPriceChg",
        "callPriceChgPct",
        "putLastPrice",
        "putPriceChg",
        "putPriceChgPct",
      ],
    });
    return JSON.stringify(optionData);
  } catch (error) {
    console.log(error);
  }
  return {};
}

async function processPositions(portfolio) {
  //console.log("Process Position Start");
  let newPortfolio = {};
  if (portfolio) {
    let positions = portfolio?.positions;
    let newPositions = [];
    for (let index = 0; index < positions?.length; index++) {
      const position = positions[index];
      let optionData = await getPositionPrice(position);
      let priceDetail = JSON.parse(optionData);
      let newPosition = { ...position };
      if (position.option === "Call") {
        newPosition.lastPrice = priceDetail.callLastPrice;
      }
      if (position.option === "Put") {
        newPosition.lastPrice = priceDetail.putLastPrice;
      }
      newPosition.pl = newPosition.lastPrice - newPosition.premium;
      newPosition.plPct = (100 * newPosition.pl) / newPosition.premium;
      newPositions.push(newPosition);
    }
    newPortfolio = { ...portfolio };
    newPortfolio.positions = newPositions;
  }
  //console.log("Process Position End");
  return newPortfolio;
}

async function processPortfolio(data) {
  //console.log("Process Portfolio Start");
  //console.log(data);
  let portfolio = JSON.parse(data);
  let list = [];
  for (let index = 0; index < portfolio?.length; index++) {
    const element = portfolio[index];
    let newPortfolio = await processPositions(element);
    list.push(newPortfolio);
  }
  //console.log("Process Portfolio End");
  return list;
}

const getPortfolio = asyncHandler(async (req, res) => {
  try {
    //console.log("getPortfolio");
    let user = req.user;
    const data = await Portfolio.findAll({
      order: [["id", "DESC"]],
      where: {
        user: user.user,
      },
      attributes: ["id", "user", "underlying", "expiryDate", "positions"],
    });
    //
    let portfolio = await processPortfolio(JSON.stringify(data));
    //
    res.json({ response: portfolio });
  } catch (error) {
    res.json({ message: error.message });
  }
});

const savePortfolio = asyncHandler(async (req, res) => {
  let user = req.user;
  const portfolio = req.body;
  portfolio.user = user.user;
  try {
    if (portfolio) {
      const newPortfolio = await Portfolio.create({
        user: portfolio.user,
        underlying: portfolio.underlying,
        expiryDate: portfolio.expiryDate,
        positions: portfolio.positions,
      });
      const id = await newPortfolio.id;
      res.json({ message: "Strategy is added to portfolio" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const deletePortfolio = asyncHandler(async (req, res) => {
  //console.log("delete Portfolio");
  try {
    const { id } = req.body;
    await Portfolio.destroy({
      where: {
        id: id,
      },
      force: true,
    });
    res.json({ message: "Portfolio item is deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  getPortfolio,
  savePortfolio,
  deletePortfolio,
};
