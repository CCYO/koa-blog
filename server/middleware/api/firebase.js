/**
 * @description middleware of upload to GCS by Formidable
 */
const {
  DEFAULT: {
    GCS_ref,
    CACHE: {
      TYPE: { PAGE },
    },
  },
} = require("../../config");
//  0406
const { parse } = require("../../utils/gcs");
//  0406
const C_BlogImg = require("../../controller/blogImg");
//  0406
const C_Img = require("../../controller/img");

async function user(ctx, next) {
  let data = await parse.user(ctx);
  if (data.hasOwnProperty("age")) {
    data.age = Number.parseInt(data.age);
  }
  // let $$me = ctx.session.user;
  // let res = { ...data, $$me };
  // ctx.request.body = res;
  ctx.request.body = { ...ctx.request.body, ...data };

  await next();
  return;
}

//  -----------------------------------------------------------------------------------------

const C_BlogImgAlt = require("../../controller/blogImgAlt");
const { SuccModel } = require("../../model");
/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
async function blogImg(ctx) {
  //  查找img紀錄
  let hash = ctx.query.hash;
  let imgModel = await C_Img.find(hash);
  let url;
  //  無 img 紀錄
  if (imgModel.errno) {
    console.log("@GCS無圖檔，直接創建img且作BlogImg關聯");
    //  上傳 GCS
    let res = await parse.blogImg(ctx);
    //  取得 url
    url = res[GCS_ref.BLOG];

    //  db img處理

    //  創建 img
    imgModel = await C_Img.add({ hash, url });
  }

  ctx.request.body = {
    url,
    hash: ctx.query.hash,
    name: ctx.query.name,
    blog_id: ctx.query.blog_id * 1,
    // img_id: imgModel.data.id,
  };

  //  blogImg 處理

  //  blogImgAlt 處理

  //  建立 blogImg
  const BlogImgData = {
    blog_id: ctx.query.blog_id * 1,
    name: ctx.query.name,
    img_id: imgModel.data.id,
  };
  let {
    data: { id: blogImg_id },
  } = await C_BlogImg.add(BlogImgData);
  //  建立 blogImgAlt - data: { alt_id, alt, blogImg_id, name, img_id, url, hash }
  let { data } = await C_BlogImgAlt.add({ blogImg_id });
  let cache = { [PAGE.BLOG]: [ctx.query.blog_id * 1] };
  ctx.body = new SuccModel({ data, cache });
}

module.exports = {
  blogImg,
  //  ------------------------------------------------------------------------------------------
  user,
};
