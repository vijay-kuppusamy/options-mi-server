const asyncHandler = require("express-async-handler");

const Watchlist = require("../models/watchlist");
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

async function processPositions(watchlist) {
  //console.log("Process Position Start");
  let newWatchlist = {};
  if (watchlist) {
    let positions = watchlist?.positions;
    let newPositions = [];
    for (let index = 0; index < positions?.length; index++) {
      const position = positions[index];
      let optionData = await getPositionPrice(position);
      let priceDetail = JSON.parse(optionData);
      let newPosition = { ...position };
      if (position.option === "Call") {
        newPosition.lastPrice = priceDetail.callLastPrice;
        newPosition.priceChg = priceDetail.callPriceChg;
        newPosition.priceChgPct = priceDetail.callPriceChgPct;
      }
      if (position.option === "Put") {
        newPosition.lastPrice = priceDetail.putLastPrice;
        newPosition.priceChg = priceDetail.putPriceChg;
        newPosition.priceChgPct = priceDetail.putPriceChgPct;
      }
      newPositions.push(newPosition);
    }
    newWatchlist = { ...watchlist };
    newWatchlist.positions = newPositions;
  }
  //console.log("Process Position End");
  return newWatchlist;
}

async function processWatchlist(data) {
  //console.log("Process Watchlist Start");
  //console.log(data);
  let watchlist = JSON.parse(data);
  let list = [];
  for (let index = 0; index < watchlist?.length; index++) {
    const element = watchlist[index];
    let newWatchlist = await processPositions(element);
    //console.log(newWatchlist);
    list.push(newWatchlist);
  }
  //console.log("Process Watchlist End");
  return list;
}

const getWatchlist = asyncHandler(async (req, res) => {
  try {
    //console.log("getWatchlist");
    let user = req.user;
    let data = await Watchlist.findAll({
      order: [["id", "DESC"]],
      where: {
        user: user.user,
      },
      attributes: ["id", "user", "underlying", "expiryDate", "positions"],
    });
    //
    let watchlist = await processWatchlist(JSON.stringify(data));
    //
    res.json({ response: watchlist });
  } catch (error) {
    console.log(error);
    res.json({ message: error.message });
  }
});

const saveWatchlist = asyncHandler(async (req, res) => {
  const watchlist = req.body;
  let user = req.user;
  watchlist.user = user.user;
  try {
    if (watchlist) {
      const newWatchlist = await Watchlist.create({
        user: watchlist.user,
        underlying: watchlist.underlying,
        expiryDate: watchlist.expiryDate,
        positions: watchlist.positions,
      });
      const id = await newWatchlist.id;
      res.json({ message: "Strategy is added to watchlist" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const deleteWatchlist = asyncHandler(async (req, res) => {
  //onsole.log("delete Watchlist");
  try {
    const { id } = req.body;
    await Watchlist.destroy({
      where: {
        id: id,
      },
      force: true,
    });
    res.json({ message: "Watchlist is deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  getWatchlist,
  saveWatchlist,
  deleteWatchlist,
};
