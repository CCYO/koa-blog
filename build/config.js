const PREFIX = "CONS";
const REG = {
  PREFIX,
  // REPLACE: /[-]{2}(CONS\.\S+?)[-]{2}/g,
  REPLACE: new RegExp(`[-]{2}(${PREFIX}\\.\\S+?)[-]{2}`, "g"),
  // IGNORE: /\<%(?!(-\s+include)|([=\-]?\s+.*?CONS\.))/g,
  IGNORE: new RegExp(
    `\\<%(?!(-\\s+include)|([=\\-]?\\s+.*?${PREFIX}\\.))`,
    "g"
  ),
};
const EJS = {
  REG,
};

module.exports = {
  PORT: 8080,
  PUBLIC_PATH: "/public",
  BUILD: {
    DIST: "dist",
    ASSET: "assets",
    VIEW: "views",
    STYLE: "css",
    SCRIPT: "js",
    FONT: "fonts",
    IMAGE: "imgs",
  },
  SERVER: {
    ASSET: "assets",
  },
  EXT: "ejs",
  EJS,
};
