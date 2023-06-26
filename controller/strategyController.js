const asyncHandler = require("express-async-handler");

const Strategy = require("../models/strategy");

const getStrategies = asyncHandler(async (req, res) => {
  try {
    let user = req.user;
    //console.log(user);
    const data = await Strategy.findAll({
      order: [["id", "DESC"]],
      where: {
        user: user.user,
      },
      attributes: ["user", "name", "notes", "positions"],
    });
    res.json({ data });
  } catch (error) {
    res.json({ error });
  }
});

const saveStrategy = asyncHandler(async (req, res) => {
  //console.log(req.body);
  let user = req.user;
  let strategy = req.body;
  try {
    if (strategy && strategy.name) {
      strategy.user = user.user;
      const data = await Strategy.findOne({
        where: {
          user: strategy.user,
          name: strategy.name,
        },
      });

      if (data && strategy.action === "update") {
        data.positions = strategy.positions;
        const id = await data.save();
        res.json({ message: "Strategy is saved" });
      }

      if (data && strategy.action === "create") {
        res.status(400).json({
          message:
            "Strategy name already been used, please choose different name.",
        });
      }
      if (!data && strategy.action === "create") {
        const newStrategy = await Strategy.create({
          user: strategy.user,
          name: strategy.name,
          notes: strategy.notes,
          positions: strategy.positions,
        });
        const id = await newStrategy.id;
        res.json({ message: "Strategy is created" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const deleteStrategy = asyncHandler(async (req, res) => {
  try {
    const strategy = req.body;
    await Strategy.destroy({
      where: {
        user: strategy.user,
        name: strategy.name,
      },
      force: true,
    });
    res.json({ message: "Strategy is deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  getStrategies,
  saveStrategy,
  deleteStrategy,
};
