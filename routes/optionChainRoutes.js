const express = require("express");
const {
  getOptionChain,
  getOptionData,
} = require("../controller/optionChainController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

//router.get('/', authenticate, getOptionChain);
router.post("/", getOptionChain);
router.post("/optiondata", getOptionData);

module.exports = router;
