const asyncHandler = require("express-async-handler");

const IndicesIoed = require("../models/indicesIoed");
const IndicesOptionIoed = require("../models/indicesOptionIoed");

function getNearestStrike(spotPrice, stepValue) {
  return Math.round(spotPrice / stepValue) * stepValue;
}

const getIndicesHistoricalIoedData = asyncHandler(async (req, res) => {
  try {
    // console.log("getIndicesHistoricalIoedData");
    // console.log(req.body);
    let { symbol, date } = req.body;

    if (symbol && date) {
      let stepValue = 50;
      if (symbol === "BANKNIFTY") stepValue = 500;

      const indicesIoed = await IndicesIoed.findAll({
        order: [["time", "ASC"]],
        where: {
          symbol: symbol,
          date: date,
        },
        attributes: ["time", "open"],
        raw: true,
      });

      if (indicesIoed && indicesIoed.length > 0) {
        //
        let response = {};
        const timeArray = indicesIoed.map((item) => item.time);
        const indicsOpenArray = indicesIoed.map((item) => item.open);
        response.time = timeArray;
        response.indicsOpen = indicsOpenArray;

        let open = indicesIoed[0].open;
        let strikePrice = getNearestStrike(open, stepValue);

        const indicesOptionIoedCE = await IndicesOptionIoed.findAll({
          order: [["time", "ASC"]],
          where: {
            symbol: symbol,
            date: date,
            strikePrice: strikePrice,
            optionType: "CE",
          },
          attributes: ["time", "open"],
        });

        const ceOpenArray = indicesOptionIoedCE.map((item) => item.open);
        response.ceOpen = ceOpenArray;

        const indicesOptionIoedPE = await IndicesOptionIoed.findAll({
          order: [["time", "ASC"]],
          where: {
            symbol: symbol,
            date: date,
            strikePrice: strikePrice,
            optionType: "PE",
          },
          attributes: ["time", "open"],
        });
        const peOpenArray = indicesOptionIoedPE.map((item) => item.open);
        response.peOpen = peOpenArray;
        res.json(response);
      }
    } else {
      res.json({});
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = {
  getIndicesHistoricalIoedData,
};
