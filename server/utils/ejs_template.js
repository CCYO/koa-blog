let fs = require("fs");
const lodash = require("lodash");
const { resolve } = require("path");
const filePath = {
  comment: {
    tree: resolve(__dirname, "../views/template/tree.ejs"),
    item: resolve(__dirname, "../views/template/item.ejs"),
  },
};

const template = {
  comment: {
    tree: fs.readFileSync(filePath.comment.tree, "utf-8"),
    item: fs.readFileSync(filePath.comment.item, "utf-8"),
  },
};

module.exports = {
  comment: {
    tree: lodash.template(template.comment.tree),
    item: lodash.template(template.comment.item),
  },
};
