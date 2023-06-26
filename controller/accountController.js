const User = require("../models/user");

// @desc    get user
// @route   GET /account
// @access  private
const getUser = async (req, res) => {
  let user = req.user;
  try {
    if (user) {
      let data = await User.findOne({
        where: {
          email: user.user,
        },
        attributes: ["name", "email", "mobile"],
      });
      res.json(data);
    } else {
      res.status(400).json({ message: "Error while getting user info" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    save user
// @route   POST /account
// @access  private
const saveUser = async (req, res) => {
  //console.log(req.body);
  const user = req.body;
  try {
    let data = await User.upsert(user);
    res.json({ message: "Updated" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getUser,
  saveUser,
};
