const { getAllSymbols } = require("./underlyingConfigController");

const getSymbols = async (req, res) => {
  try {
    var response = {};
    const symbols = await getAllSymbols();
    if (symbols) {
      response.symbols = symbols;
      //console.log(JSON.stringify(response));
      res.json(response);
    }
  } catch (error) {
    res.json({ error });
  }
};

module.exports = { getSymbols };
