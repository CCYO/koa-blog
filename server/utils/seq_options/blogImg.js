const xss = require("../xss");

const CREATE = {
  one: ({ blog_id, name, img_id }) => ({
    blog_id,
    img_id,
    name: xss(name),
  }),
};

module.exports = {
  CREATE,
};
