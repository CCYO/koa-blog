const BlogImg = require("../server/blogImg");
const Opts = require("../utils/seq_findOpts");
const { ErrRes, SuccModel, ErrModel, MyErr } = require("../model");

async function add({ blog_id, name, img_id }) {
  let data = await BlogImg.create(
    Opts.BLOG_IMG.CREATE.one({ blog_id, name, img_id })
  );
  return new SuccModel({ data });
}
async function countBlogImgAlt(blogImg_id) {
  let count = await BlogImg.countBlogImgAlt(blogImg_id);
  if (!count) {
    return new ErrModel({
      ...ErrRes.BLOG_IMG.READ.NO_BLOG_IMG_ALT,
      error: `找不到對應 blogImg_id/${blogImg_id} 的 blogImgAlt`,
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
};
