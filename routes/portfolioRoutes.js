const express = require("express");
const {
  getPortfolio,
  savePortfolio,
  deletePortfolio,
} = require("../controller/portfolioController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getPortfolio);
router.post("/", authenticate, savePortfolio);
router.post("/delete", authenticate, deletePortfolio);

module.exports = router;
