const asyncHandler = require("express-async-handler");

const IndicesHistoricalData = require("../models/indicesHistoricalData");

const getIndicesHistoricalData = asyncHandler(async (req, res) => {
  try {
    //console.log("getIndicesHistoricalData");
    let symbol = req.query.symbol;
    const data = await IndicesHistoricalData.findAll({
      limit: 30,
      order: [["id", "ASC"]],
      where: {
        symbol: symbol,
      },
      attributes: ["id", "symbol", "date", "close"],
    });
    res.json({ response: data });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = {
  getIndicesHistoricalData,
};
