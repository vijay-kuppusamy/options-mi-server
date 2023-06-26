const express = require("express");
const path = require("path");
const expressip = require("express-ip");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/config");
const dotenv = require("dotenv");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(config.cors));
app.use(expressip().getIpInfoMiddleware);
app.use(cookieParser());

app.use("/api/home", require("./routes/indexRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/account", require("./routes/accountRoutes"));
app.use("/api/optionchain", require("./routes/optionChainRoutes"));
app.use("/api/strategy", require("./routes/strategyRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));
app.use("/api/portfolio", require("./routes/portfolioRoutes"));
app.use(
  "/api/option-historical-data",
  require("./routes/optionHistoricalDataRoutes")
);

app.use(express.static(path.join(__dirname, "public")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
