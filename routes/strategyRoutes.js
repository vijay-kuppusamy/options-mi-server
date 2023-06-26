const express = require("express");
const {
  getStrategies,
  saveStrategy,
  deleteStrategy,
} = require("../controller/strategyController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getStrategies);
router.post("/", authenticate, saveStrategy);
router.post("/delete", authenticate, deleteStrategy);

module.exports = router;
