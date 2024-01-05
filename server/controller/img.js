//  0406
const { SuccModel, ErrModel, ErrRes, MyErr } = require("../model");
//  0406
const Opts = require("../utils/seq_findOpts");
//  0406
const Img = require("../server/img");
//  0406
async function add(data) {
  if (!Object.entries(data).length) {
    throw new MyErr(ErrRes.IMG.CREATE.NO_DATA);
  }
  let img = await Img.create(data);
  return new SuccModel({ data: img });
}
//  0406
async function find(hash) {
  //  找img
  let data = await Img.read(Opts.IMG.find(hash));
  if (!data) {
    return new ErrModel(ErrRes.IMG.NO_DATA);
  }
  return new SuccModel({ data });
}

module.exports = {
  //  0406
  add,
  //  0406
  find,
  associateWithBlog,

  uploadImgToBlog,
  uploadImg,
};

const {
  DEFAULT: {
    CACHE: {
      TYPE: { PAGE },
    },
  },
} = require("../config");
const Controller_BlogImgAlt = require("./blogImgAlt");
const Controller_BlogImg = require("../controller/blogImg");

const { parse } = require("../utils/gcs");

async function uploadImgToBlog({ url, hash, name, blog_id }) {
  //  尋找img
  let { data: img } = await find(hash);
  //  img不存在，新建img
  if (!img) {
    //  創建img
    let res_img = await addImg({ hash, url });
    if (!res_img.errno) {
      return res_img;
    }
    let { data: img } = res_img;
  }
  let img_id = img.id;
  let res = await associateWithBlog({ img_id, blog_id, name });
  if (res.errno) {
    return res;
  }
  // let { blog_id, blogImg_id, name, alt_id, alt } = res.data
  let data = { img_id, hash, url, ...res.data };
  return new SuccModel({ data, cache: { [PAGE.BLOG]: blog_id } });
}

async function associateWithBlog({ img_id, blog_id, name }) {
  //  與blog作連結
  //  創建blogImg
  let res_blogImg = await Controller_BlogImg.createBlogImg({
    blog_id,
    img_id,
    name,
  });
  if (res_blogImg.errno) {
    return res_blogImg;
  }
  let { id: blogImg_id } = res_blogImg.data;
  console.log("@ 完成 blogImg創建 => ", res_blogImg.data);
  //  創建blogImgAlt
  let res_blogImgAlt = await Controller_BlogImgAlt.addBlogImgAlt({
    blogImg_id,
  });
  if (res_blogImgAlt.errno) {
    return res_blogImgAlt;
  }
  let { id, alt } = res_blogImgAlt.data;
  console.log("@ 完成 alt創建 => ", res_blogImgAlt.data);
  let data = {
    blog_id,
    blogImg_id,
    name,
    id,
    alt,
  };
  return new SuccModel({ data });
}

/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
async function uploadImg(ctx, next) {
  let { blog_id, hash } = ctx.query;
  //  查找img紀錄，若有則代表GCS內已有圖檔，直接將該img紀錄與blog作連結
  let img = await readImg({ hash }, blog_id);
  img && console.log("@GCS有圖檔，僅作BlogImg關聯");
  if (!img) {
    //  若GCS沒有該圖檔，則 upload GCS
    let { blogImg: url } = await parse(ctx);
    img = await Img.createImg({ hash, url }, blog_id);
    console.log("@GCS無圖檔，直接創建img且作BlogImg關聯");
  }

  ctx.body = new SuccModel(img);
}
