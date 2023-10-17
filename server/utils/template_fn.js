let fs = require("fs");
const lodash = require("lodash");
const { resolve } = require("path");
const filePath = {
  // comments: resolve(__dirname, "../../src/views/pages/blog/template/list.ejs"),
  comment_list: resolve(__dirname, "../views/template/list.ejs"),
  comment_item: resolve(__dirname, "../views/template/item.ejs"),
};

const template_string = {
  comment_list: fs.readFileSync(filePath.comment_list, "utf-8"),
  comment_item: fs.readFileSync(filePath.comment_item, "utf-8"),
};

module.exports = {
  comment_list: lodash.template(template_string.comment_list),
  comment_item: lodash.template(template_string.comment_item),
};
