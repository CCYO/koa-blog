const CONFIG = require("./config");
const BASE = require("./webpack.base.config");
const DEV = require("./webpack.dev.config");
const PROD = require("./webpack.prod.config");

module.exports = {
  CONFIG,
  BASE,
  DEV,
  PROD,
};
