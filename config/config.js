const dotenv = require("dotenv");
dotenv.config();

const config = {
  cors: {
    credentials: true,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    origin: process.env.ORIGIN,
  },
};

module.exports = config;
