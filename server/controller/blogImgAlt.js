const BlogImgAlt = require("../server/blogImgAlt");
const Opts = require("../utils/seq_findOpts");
const { SuccModel, ErrRes, MyErr } = require("../model");
const { ENV, DEFAULT } = require("../config");

async function add(blogImg_id) {
  let data = await BlogImgAlt.create({ blogImg_id });
  return new SuccModel({ data });
}
//  查詢 alt 的完整數據，且以author_id 與 blog_id 校驗是否有權利更改
async function findWholeInfo({ author_id, blog_id, alt_id }) {
  if (!author_id || !blog_id || !alt_id) {
    throw new MyErr(ErrRes.BLOG_IMG.READ.NO_ARGS);
  }
  //  data { id, alt, blog: { id, author_id }, blogImg: { id, name }, img: { id, url, hash }}
  let data = await BlogImgAlt.find(Opts.BLOG_IMG_ALT.FIND.wholeInfo(alt_id));
  if (!data) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_EXIST);
  } else if (data.blog.author_id !== author_id) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_AUTHOR);
  } else if (data.blog.id !== blog_id) {
    throw new MyErr(ErrRes.BLOG_IMG_ALT.READ.NOT_BLOG);
  }
  return new SuccModel({ data });
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
  //  { id, alt, blog: { id, author_id }, blogImg: { id, name }, img: { id, url, hash }}
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
};
