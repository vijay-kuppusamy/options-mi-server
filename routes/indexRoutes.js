const express = require("express");
const router = express.Router();
const { getSymbols } = require("../controller/homeController");
const { getIndexPriceDetail } = require("../controller/priceDetailController");
const {
  getIndicesHistoricalData,
} = require("../controller/historicalDataController");

router.get("/symbols", getSymbols);
router.get("/price-detail", getIndexPriceDetail);
router.get("/historical-data", getIndicesHistoricalData);

module.exports = router;
