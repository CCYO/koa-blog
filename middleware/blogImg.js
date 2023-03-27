const { CACHE: { TYPE: { PAGE } } } = require('../conf/constant')
const { SuccModel } = require('../model')
const Controller_img = require('../controller/img')
const { parse } = require('../utils/gcs')

/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
 async function uploadImg(ctx, next) {
    let { blog_id, hash, name } = ctx.query
    //  查找img紀錄，若有則代表GCS內已有圖檔，直接將該img紀錄與blog作連結
    let { data: img } = await Controller_img.findImgThenEditBlog(hash)
    let img_id
    let url
    //  找不到，創建img
    if(!img){
        console.log('@GCS無圖檔，直接創建img且作BlogImg關聯')
        let res = await parse(ctx)
        url = res.blogImg
        let resModel = await Controller_img.addImg({hash, url})
        if(resModel.errno){
            return res
        }
        img_id = resModel.data.id
    }
    let resModel = await Controller_img.associateWithBlog({ img_id, blog_id, hash, name })
    if(resModel.errno){
        return resModel
    }
    // let { blog_id, blogImg_id, name, alt_id, alt } = resModel.data
    let data = { ...resModel.data, img_id, hash, url }
    ctx.body = new SuccModel({ data, cache: { [PAGE.BLOG]: blog_id } })
}

module.exports = {
    uploadImg
}