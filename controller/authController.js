const useragent = require("express-useragent");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} = require("firebase/auth");

//Project imports
const { auth } = require("../auth/firebase");
const User = require("../models/user");
const UserSession = require("../models/userSession");
const LoginHistory = require("../models/loginHistory");
const { async } = require("@firebase/util");

dotenv.config();

// @desc    register a user
// @route   POST /auth/register
// @access  Public
const register = (req, res) => {
  //
  //console.log(req.body);
  const { name, mobile, email, password } = req.body;

  if (email && password) {
    try {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          sendEmailVerification(user)
            .then(() => {
              User.upsert({ name, email, mobile })
                .then(() => {
                  res.json({
                    message:
                      "Account registered and verification email has been sent. Please check your email and verify before login",
                  });
                })
                .catch((error) => {
                  res.status(400).json({
                    message: "Error while registering user",
                    error: error.message,
                  });
                });
            })
            .catch((error) => {
              res.status(400).json({
                message: "Error while sending verification email",
                error: error.message,
              });
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({
            message: "Email already registered",
            error: error.message,
          });
        });
    } catch (error) {
      res.status(400).json({
        message: "Error while registering user",
        error: error.message,
      });
    }
  } else {
    res
      .status(400)
      .json({ message: "Error while registering user", error: error.message });
  }
};

const updateUserSession = async (email, sessionId, ipInfo) => {
  try {
    const session = await UserSession.findOne({
      where: {
        email: email,
      },
    });
    if (session) {
      session.sessionId = sessionId;
      session.ip = ipInfo.ip;
      const id = await session.save();
    } else {
      const sess = await UserSession.create({
        email: email,
        sessionId: sessionId,
        ip: ipInfo.ip,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const createLoginHistory = async (email, ipInfo, userAgent) => {
  try {
    const history = await LoginHistory.create({
      email: email,
      ip: ipInfo.ip,
      userAgent: userAgent,
      city: ipInfo.city,
      country: ipInfo.country,
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    login a user
// @route   POST /auth/login
// @access  Public
const login = async (req, res) => {
  //console.log(req.body);
  const { email, password } = req.body;

  const ipInfo = req.ipInfo;
  var source = req.headers["user-agent"];
  const ua = useragent.parse(source);

  if (email && password) {
    // recoring login history
    createLoginHistory(email, ipInfo, ua);
    try {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          const emailVerified = user.emailVerified;
          // console.log(user.emailVerified);
          // console.log(user.email);
          if (!emailVerified) {
            res.status(400).json({
              message:
                "Email not verified after registration. Please verify your email",
            });
          } else {
            const sessionId = uuidv4();
            const token = jwt.sign(
              { user: email, sid: sessionId },
              process.env.JWT_SECRET,
              {
                expiresIn: "7d",
              }
            );
            res.cookie("token", token, {
              httpOnly: true,
              maxAge: 7 * 24 * 60 * 60 * 1000,
              //sameSite: "none",
              //secure: false
            });
            //create/update user session
            updateUserSession(email, sessionId, ipInfo);
            res.json({ email: email });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({ message: "invalid username or password" });
        });
    } catch (error) {
      res.status(400).json({ message: "invalid username or password" });
    }
  } else {
    res.status(400).json({ message: "invalid username or password" });
  }
};

const loginWithGoogle = async (req, res) => {
  //console.log(req.body);
  const { name, email, mobile } = req.body;

  const ipInfo = req.ipInfo;
  var source = req.headers["user-agent"];
  const ua = useragent.parse(source);

  try {
    createLoginHistory(email, ipInfo, ua);
    let user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      user = await User.create({ name, email, mobile });
    }

    const sessionId = uuidv4();
    const token = jwt.sign(
      { user: email, sid: sessionId },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      //sameSite: "none",
      //secure: false
    });
    //create/update user session
    updateUserSession(email, sessionId, ipInfo);
    res.json({ email: email });
  } catch (error) {
    res.status(400).json({
      message: "Error while login",
      error: error.message,
    });
  }
};

const validateSession = async (user) => {
  let isValid = true;
  try {
    const email = user.user;
    const sessionId = user.sid;
    //console.log(sessionId, email);

    const session = await UserSession.findOne({
      where: {
        email: email,
      },
    });
    if (session) {
      if (email === session.email && sessionId === session.sessionId) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.log(error);
  }
  return isValid;
};

// @desc    authenticate a user
// @route   POST /auth/login
// @access  Public
const authenticateUser = (req, res) => {
  //console.log("authenticate");
  let user = req.user;
  try {
    res.json({ email: user.user });
  } catch (error) {
    res.status(401).json({ message: "Please login" });
  }
};

// @desc    get the user
// @route   POST /auth/user
// @access  Public
const getUser = (req, res) => {
  //console.log("getUser");
  let user = req.user;
  try {
    res.json({ email: user.user });
  } catch (error) {
    res.status(401).json({ message: "Please login" });
  }
};

// @desc    reset user password
// @route   POST /auth/reset
// @access  Public
const reset = (req, res) => {
  //console.log("reset");
  const { email } = req.body;
  //console.log(email);
  try {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res.status(200).json({
          message:
            "Password reset email sent!. Please follow the email link to reset your password",
        });
      })
      .catch((error) => {
        res
          .status(400)
          .json({ message: "Error while resetting your password" });
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error while resetting your password" });
  }
};

// @desc    logout
// @route   POST /auth/logout
// @access  Public
const logout = (req, res) => {
  try {
    signOut(auth)
      .then(() => {
        res
          //.clearCookie("token", { path: "/", domain: config.server.domain })
          .clearCookie("token")
          .send();
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({ message: "server error" });
      });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "server error" });
  }
};

//
module.exports = {
  register,
  login,
  loginWithGoogle,
  logout,
  authenticateUser,
  getUser,
  reset,
  validateSession,
};
