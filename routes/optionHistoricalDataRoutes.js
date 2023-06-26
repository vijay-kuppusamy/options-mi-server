const express = require("express");
const router = express.Router();

const {
  getIndicesHistoricalIoedData,
} = require("../controller/optionHistoricalDataController");

router.post("/", getIndicesHistoricalIoedData);

module.exports = router;
