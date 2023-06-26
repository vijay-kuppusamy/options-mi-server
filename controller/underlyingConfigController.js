const asyncHandler = require("express-async-handler");

const UnderlyingConfig = require("../models/underlyingConfig");

const getUnderlyingConfig = async (symbol) => {
  try {
    const data = await UnderlyingConfig.findOne({
      where: {
        symbol: symbol,
      },
      attributes: [
        "symbol",
        "underlying",
        "underlyingType",
        "lotSize",
        "qtyFrezze",
        "stepValue",
      ],
    });
    return data;
  } catch (error) {
    return { error };
  }
};

const getAllSymbols = async () => {
  try {
    const data = await UnderlyingConfig.findAll({
      order: [["id", "ASC"]],
      attributes: ["symbol"],
    });
    return data;
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getUnderlyingConfig,
  getAllSymbols,
};
