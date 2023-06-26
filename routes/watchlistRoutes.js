const express = require("express");
const {
  getWatchlist,
  saveWatchlist,
  deleteWatchlist,
} = require("../controller/watchlistController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, getWatchlist);
router.post("/", authenticate, saveWatchlist);
router.post("/delete", authenticate, deleteWatchlist);

module.exports = router;
