//  0406
const { SuccModel } = require('../model')
//  0406
const { CACHE: { TYPE: { PAGE } } } = require('../conf/constant')
//  0406
const C_BlogImgAlt = require('../controller/blogImgAlt')
//  0406
const { GCS_ref } = require('../conf/constant')
//  0406
const { parse } = require('../utils/gcs')
//  0406
const C_BlogImg = require('../controller/blogImg')
//  0406
const C_Img = require('../controller/img')
//  0406
/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
 async function uploadImg(ctx, next) {
    let { blog_id, hash, name } = ctx.query
    //  查找img紀錄
    let imgModel = await C_Img.find(hash)
    let url
    //  無 img 紀錄
    if(imgModel.errno){
        console.log('@GCS無圖檔，直接創建img且作BlogImg關聯')
        //  上傳 GCS
        let res = await parse(ctx)
        //  取得 url
        url = res[GCS_ref.BLOG]
        //  創建 img
        imgModel = await C_Img.add({hash, url})
    }
    //  建立 blogImg
    let img_id = imgModel.data.id
    let { data: { id: blogImg_id } } = await C_BlogImg.add({ blog_id, img_id, name })
    //  建立 blogImgAlt - data: { alt_id, alt, blogImg_id, name, img_id, url, hash }
    let { data } = await C_BlogImgAlt.add({ blogImg_id })
    let cache = { [PAGE.BLOG]: blog_id }
    ctx.body = new SuccModel({ data, cache })
}

module.exports = {
    uploadImg   //  0406
}