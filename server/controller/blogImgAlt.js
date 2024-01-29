const Opts = require("../utils/seq_findOpts");
const { ErrModel, SuccModel, ErrRes, MyErr } = require("../model");
const BlogImgAlt = require("../server/blogImgAlt");
const { ENV, DEFAULT } = require("../config");

//  -------------------------------------------------------------------------------------------------
async function add(blogImg_id) {
  let data = await BlogImgAlt.create({ blogImg_id });
  return new SuccModel({ data });
}
async function findWholeInfo({ author_id, blog_id, alt_id }) {
  let res = await BlogImgAlt.find(Opts.BLOG_IMG_ALT.FIND.wholeInfo(alt_id));
  if (!res) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_EXIST);
  }
  if (author_id && data.author.id !== author_id) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_AUTHOR);
  }
  if (blog_id && data.blog_id !== blog_id) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_BLOG);
  }
  return new SuccModel({ data: res });
}
async function removeList(id_list) {
  let row = await BlogImgAlt.destoryList(Opts.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.REMOVE.ROW);
  }
  return new SuccModel({ data: row });
}
async function modify({ author_id, alt_id, blog_id, alt }) {
  await BlogImgAlt.update(alt_id, { alt });
  let { data } = await findWholeInfo({ author_id, blog_id, alt_id });
  let opts = { data };
  if (!ENV.isNoCache) {
    opts.cache = {
      [DEFAULT.CACHE.TYPE.PAGE.BLOG]: [blog_id],
    };
  }
  return new SuccModel(opts);
}
module.exports = {
  modify,
  removeList,
  findWholeInfo,
  add,
  //  --------------------------------------------------------
  cancelWithBlog, //  0326
};

//  --------------------------------------------------------------------------------------------------------
async function cancelWithBlog(blogImg_id, blogImgAlt_list) {
  let count = await BlogImgAlt.count(Opts.BLOGIMGALT.count(blogImg_id));
  if (!count) {
    console.log("沒有count");
    return new ErrModel(ErrRes.BLOG_IMG_ALT.NOT_EXIST);
  }

  //  既存數量 = 要刪除的數量，刪除整筆 blogImg
  if (count === blogImgAlt_list.length) {
    console.log("刪除整筆");
    return await Controller_BlogImg.removeBlogImg(blogImg_id);
  }
  console.log("刪除個別");
  //  各別刪除 blogImgAlt
  return await _removeBlogImgAlts(blogImgAlt_list);
}

//  0326
async function _removeBlogImgAlts(blogImgAlt_list) {
  let ok = await BlogImgAlt.deleteBlogImgAlts(blogImgAlt_list);
  if (!ok) {
    return new ErrModel(BLOG_IMG_ALT.REMOVE_ERR);
  }
  return new SuccModel();
}
