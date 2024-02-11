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
const parse = require("../../utils/gcs");
const C_Img = require("../../controller/img");

//  -----------------------------------------------------------------------------------------

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
    } else {
      url = data.url;
      img_id = data.id;
    }
    name = decodeURIComponent(name);
  }

  ctx.request.body = {
    blog_id: blog_id * 1,
    hash,
    url,
    img_id,
    name,
    blogImg_id,
  };
  await next();
  return;
}

async function user(ctx, next) {
  let data = await parse.user(ctx);
  if (data.hasOwnProperty("age")) {
    data.age = Number.parseInt(data.age);
  }
  ctx.request.body = data;
  await next();
  return;
}

module.exports = {
  user,
  blogImg,
};
