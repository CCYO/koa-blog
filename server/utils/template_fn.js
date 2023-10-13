let fs = require("fs");
const lodash = require("lodash");
const { resolve } = require("path");
const filePath = {
  // comments: resolve(__dirname, "../../src/views/pages/blog/template/list.ejs"),
  comments: resolve(__dirname, "../views/template/list.ejs"),
};

const template_string = {
  comments: fs.readFileSync(filePath.comments, "utf-8"),
};

module.exports = {
  comments: lodash.template(template_string.comments),
};
