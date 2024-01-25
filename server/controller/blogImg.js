const Opts = require("../utils/seq_findOpts");
const {
  //  0406
  MyErr,
  ErrRes,
  SuccModel,
  ErrModel,
} = require("../model");
const BlogImg = require("../server/blogImg"); //  0406
const { Blog } = require("../db/mysql/model");
//  0429
async function findInfoForRemoveBlog(blog_id) {
  let list = await BlogImg.readList(
    Opts.BLOG_IMG.findInfoForRemoveBlog(blog_id)
  );
  if (!list.length) {
    return new ErrModel(ErrRes.BLOG_IMG.READ.NOT_EXIST);
  }
  return new SuccModel({ data: list });
}

//  --------------------------------------------------------------------------------
async function add({ blog_id, name, img_id }) {
  let data = await BlogImg.create({ blog_id, name, img_id });
  return new SuccModel({ data });
}
async function countBlogImgAlt(blogImg_id) {
  let count = await BlogImg.countBlogImgAlt(blogImg_id);
  if (!count) {
    return new ErrModel({
      ...ErrRes.BLOG_IMG.READ.NO_BLOG_IMG_ALT,
      msg: `找不到對應 blogImg_id/${blogImg_id} 的 blogImgAlt`,
    });
  }
  return new SuccModel({ data: count });
}
async function removeList(id_list) {
  let row = await BlogImg.destoryList(Opts.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.BLOG_IMG.REMOVE.ROW);
  }
  return new SuccModel({ data: row });
}

module.exports = {
  removeList,
  countBlogImgAlt,
  add,
  //  ----------------------------------------------------------------------------
  findInfoForRemoveBlog,
  //  0408

  modifyBlogImg,
};

//  0327
async function modifyBlogImg({ id, blog_id, alt }) {
  let data = [{ id, blog_id, alt }];
  let ok = await BlogImg.updateBlogImg(data);
  if (!ok) {
    return new ErrModel(UPDATE_ERR);
  }
  console.log("成功");
  return new SuccModel(null, { blog: [blog_id] });
}
