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
async function blogImg(ctx, next) {
  //  找blogImg_id
  // let { blogImg_id } = ctx.request.body;
  //  blog_id, hash
  //  blogImg_id
  //  name, ext
  let { blog_id, hash, blogImg_id, name } = ctx.query;
  let url;
  let img_id;
  if (!blogImg_id) {
    //  查找img紀錄
    let { data } = await C_Img.find(hash);
    //  無 img 紀錄
    if (!data) {
      console.log("@GCS無圖檔，直接創建img且作BlogImg關聯");
      //  上傳 GCS
      let res = await parse.blogImg(ctx);
      //  取得 url
      url = res[GCS_ref.BLOG];

      //  db img處理

      //  創建 img
      // imgModel = await C_Img.add({ hash, url });
    } else {
      url = data.url;
      img_id = data.id;
    }
  }
  //  blog_id, hash, url
  //  blogImg_id
  //  name, img_id    xx / ext
  ctx.request.body = {
    blog_id: blog_id * 1,
    hash,
    url,

    img_id,
    name,

    blogImg_id,

    // img_id: imgModel.data.id,
  };
  await next();
  return;
  //  blogImg 處理

  //  blogImgAlt 處理

  //  建立 blogImg
  // const BlogImgData = {
  //   blog_id: ctx.query.blog_id * 1,
  //   name: ctx.query.name,
  //   img_id: imgModel.data.id,
  // };
  // let {
  //   data: { id: blogImg_id },
  // } = await C_BlogImg.add(BlogImgData);
  // //  建立 blogImgAlt - data: { alt_id, alt, blogImg_id, name, img_id, url, hash }
  // let { data } = await C_BlogImgAlt.add({ blogImg_id });
  // let cache = { [PAGE.BLOG]: [ctx.query.blog_id * 1] };
  // ctx.body = new SuccModel({ data, cache });
}

module.exports = {
  blogImg,
  //  ------------------------------------------------------------------------------------------
  user,
};
