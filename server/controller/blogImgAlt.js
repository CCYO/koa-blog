const Opts = require("../utils/seq_findOpts");
const { ErrModel, SuccModel, ErrRes, MyErr } = require("../model");
const BlogImgAlt = require("../server/blogImgAlt");
const { ENV, DEFAULT } = require("../config");
//  ------------------------------------------------------------------------------------------------

//  0411
async function modify({ alt_id, blog_id, alt }) {
  await BlogImgAlt.update(alt_id, { alt });
  let cache = { [DEFAULT.CACHE.TYPE.PAGE.BLOG]: [blog_id] };
  return new SuccModel({ cache });
}

//  0408
async function count(blogImg_id) {
  let data = await BlogImgAlt.count(Opts.BLOG_IMG_ALT.count(blogImg_id));
  if (!data) {
    return new ErrModel(ErrRes.BLOG_IMG_ALT.READ.NOT_EXIST);
  }
  return new SuccModel({ data });
}

//  -------------------------------------------------------------------------------------------------
async function add(blogImg_id) {
  let resModel = await BlogImgAlt.create({ blogImg_id });
  let { data } = resModel;
  // data: { alt_id, alt, blogImg_id, name, img_id, url, hash }
  // let { data } = await findWholeInfo(resModel.id);
  // let { blog_id, ...blogImgAlt } = data;
  // let opts = { data: blogImgAlt };
  // if (!ENV.isNoCache) {
  //   opts.cache = {
  //     [DEFAULT.CACHE.TYPE.PAGE.BLOG]: [blog_id],
  //   };
  // }
  return new SuccModel({ data });
}
async function findWholeInfo(alt_id) {
  let res = await BlogImgAlt.find(Opts.BLOG_IMG_ALT.FIND.wholeInfo(alt_id));
  if (!res) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_EXIST);
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
module.exports = {
  removeList,
  findWholeInfo,
  add,
  //  ----------------------------------------------------------------------.
  modify,
  //  0408
  count,
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
