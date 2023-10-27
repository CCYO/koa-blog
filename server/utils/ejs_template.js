let fs = require("fs");
const lodash = require("lodash");
const { resolve } = require("path");
const filePath = {
  comment: {
    tree: resolve(__dirname, "../views/template/tree.ejs"),
    item: resolve(__dirname, "../views/template/item.ejs"),
  },
  blog_list: resolve(__dirname, "../views/template/blog_list.ejs"),
  relationship_item: resolve(
    __dirname,
    "../views/template/relationship_item.ejs"
  ),
};

const template = {
  comment: {
    tree: fs.readFileSync(filePath.comment.tree, "utf-8"),
    item: fs.readFileSync(filePath.comment.item, "utf-8"),
  },
  blog_list: fs.readFileSync(filePath.blog_list),
  relationship_item: fs.readFileSync(filePath.relationship_item),
};

module.exports = {
  comment: {
    tree: lodash.template(template.comment.tree),
    item: lodash.template(template.comment.item),
  },
  blog_list: lodash.template(template.blog_list),
  relationship_item: lodash.template(template.relationship_item),
};
