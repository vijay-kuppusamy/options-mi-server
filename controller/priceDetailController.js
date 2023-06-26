const asyncHandler = require("express-async-handler");

const IndexPriceDetail = require("../models/indexPriceDetail");

const getIndexPriceDetail = asyncHandler(async (req, res) => {
  try {
    //console.log("getIndexPriceDetail");
    let symbol = req.query.symbol;
    const data = await IndexPriceDetail.findOne({
      where: {
        symbol: symbol,
      },
      attributes: ["symbol", "lastPrice", "change", "pChange"],
    });
    res.json({ response: data });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = {
  getIndexPriceDetail,
};
