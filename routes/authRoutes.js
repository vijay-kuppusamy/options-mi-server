/** @format */

const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth");
const {
  register,
  login,
  loginWithGoogle,
  logout,
  authenticateUser,
  getUser,
  reset,
} = require("../controller/authController");

// @desc    Login user
// @route   /auth/login
router.post("/login", login);

// @desc    Login user with google
// @route   /auth/login
router.post("/login-google", loginWithGoogle);

// @desc    authenticate user
// @route   /auth
router.get("/", authenticate, authenticateUser);

// @desc    get user
// @route   /auth
router.get("/user", authenticate, getUser);

// @desc    Register user
// @route   /auth/register
router.post("/register", register);

// @desc    reset user password
// @route   /auth/reset
router.post("/reset", reset);

// @desc    Logout user
// @route   /auth/logout
router.post("/logout", logout);

module.exports = router;
