const { BlogImgAlt } = require("../db/mysql/model");
const { ErrRes, MyErr } = require("../model");
const Init = require("../utils/init");

async function create(data) {
  try {
    let blogImgAlt = await BlogImgAlt.create(data);
    return Init.blogImgAlt(blogImgAlt);
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG_ALT.CREATE.ERR, error });
  }
}
async function find(opts) {
  let alt = await BlogImgAlt.findOne(opts);
  //  { id, alt, blog: { id, author_id }, blogImg: { id, name }, img: { id, url, hash }}
  return Init.blogImgAlt(alt);
}
async function destoryList(opts) {
  try {
    let row = await BlogImgAlt.destroy(opts);
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG_ALT.REMOVE.ERR, error });
  }
}
async function update({ id, alt }) {
  let [row] = await BlogImgAlt.update({ alt }, { where: { id } });
  if (!row) {
    throw new MyErr({
      ...ErrRes.BLOG_IMG_ALT.UPDATE.ERR,
      error: `blogImgAlt/${id} 更新失敗`,
    });
  }
  return row;
}

module.exports = {
  destoryList,
  find,
  create,
  update,
};
