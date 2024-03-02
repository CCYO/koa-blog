const { BlogImg } = require("../db/mysql/model"); //  0406
const { ErrRes, MyErr } = require("../model"); //  0406
const Init = require("../utils/init"); //  0406
async function readList(opts) {
  let list = await BlogImg.findAll(opts);
  return Init.blogImg(list);
}

//  -----------------------------------------------------------------------------------------------
async function create(data) {
  try {
    let blogImg = await BlogImg.create(data);
    return Init.blogImg(blogImg);
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG.CREATE.ERR, error });
  }
}
async function countBlogImgAlt(blogImg_id) {
  let blogImg = await BlogImg.findByPk(blogImg_id);
  if (!blogImg) {
    throw new MyErr({
      ...ErrRes.BLOG_IMG.READ.NOT_EXIST,
      error: `${ErrRes.BLOG_IMG.READ.NOT_EXIST.msg},blogImg/${blogImg_id} 不存在`,
    });
  }
  let count = await blogImg.countBlogImgAlts();
  return count;
}
async function destoryList(opts) {
  try {
    let row = await BlogImg.destroy(opts);
    return row;
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG.REMOVE.ERR, error });
  }
}
module.exports = {
  destoryList,
  countBlogImgAlt,
  create,
  //  --------------------------------------------------------------------------------------------
  readList,
};
