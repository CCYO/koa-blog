const { BlogImg } = require("../db/mysql/model");
const { ErrRes, MyErr } = require("../model");
const Init = require("../utils/init");

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
      error: `blogImg/${blogImg_id} 不存在`,
    });
  }
  //  RV count
  return await blogImg.countBlogImgAlts();
}
async function destoryList(opts) {
  try {
    //  RV row
    return await BlogImg.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ErrRes.BLOG_IMG.REMOVE.ERR, error });
  }
}
module.exports = {
  destoryList,
  countBlogImgAlt,
  create,
};
