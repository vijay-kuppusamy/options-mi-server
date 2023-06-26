const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth");
const { getUser, saveUser } = require("../controller/accountController");

router.get("/", authenticate, getUser);
router.post("/", authenticate, saveUser);

module.exports = router;
