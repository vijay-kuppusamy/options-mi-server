const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { validateSession } = require("../controller/authController");

dotenv.config();

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  //console.log(token);
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    //console.log(user);
    // validateSession(user)
    //   .then((isValid) => {
    //     //console.log('valid :' + isValid);
    //     if (isValid) {
    //       next();
    //     } else {
    //       res.clearCookie('token');
    //       res.status(401);
    //       throw new Error('Unauthorized');
    //     }
    //   })
    //   .catch((err) => {
    //     res.clearCookie('token');
    //     res.status(401);
    //     throw new Error('Unauthorized');
    //   });
    next();
  } catch (err) {
    //console.log(err);
    res.clearCookie("token");
    res.status(401);
    throw new Error("Unauthorized");
  }
};

module.exports = { authenticate };
