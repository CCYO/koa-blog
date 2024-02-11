const { SuccModel } = require("../model");
const Blog = require("./blog");
//  0411
async function findList(author_id, options) {
  // data: { author, albums }
  let { data } = await Blog.findAlbumList(author_id, options);
  return new SuccModel({ data });
}

module.exports = {
  findList,
};
