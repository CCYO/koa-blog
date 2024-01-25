const { ErrRes, MyErr } = require("../model"); //  0406
const Init = require("../utils/init"); //  0406
const { BlogImgAlt } = require("../db/mysql/model"); //  0406
//  0411
async function update(id, data) {
  let [row] = await BlogImgAlt.update(data, { where: { id } });
  if (!row) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.UPDATE);
  }
  return row;
}
//  ------------------------------------------------------------------------------------
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
  return Init.alt(alt);
}
async function destoryList(opts) {
  try {
    let row = await BlogImgAlt.destroy(opts);
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG_ALT.REMOVE.ERR, error });
  }
}
module.exports = {
  destoryList,
  find,
  create,
  //    -------------------------------------------------------------------------------
  update,
};

async function courtOfSomeImgInBlog({ blog_id, blogImg_id }) {
  let {} = await BlogImgAlt.findAndCountAll({
    where: { blogImg_id },
  });
}
