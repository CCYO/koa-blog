const { 
    readImg,
    createImg
} = require('../server/img')

const {
    createBlogImg
} = require('../server/blogImg')

const {
    createBlogImgAlt
} = require('../server/blogImgAlt')

const { parse } = require('../utils/gcs')

const { SuccModel, ErrModel } = require('../model')

/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
 async function uploadImg(ctx, next) {
    let { blog_id, hash, name } = ctx.query
    //  查找img紀錄，若有則代表GCS內已有圖檔，直接將該img紀錄與blog作連結
    let img = await readImg({hash})
    //  找不到，創建img
    if(!img){
        console.log('@GCS無圖檔，直接創建img且作BlogImg關聯')
        let res = await parse(ctx)
        let { blogImg: url } = res
        img = await createImg({hash, url})
    }
    //  有找到，與blog作關聯
    console.log('@GCS有圖檔，僅作BlogImg關聯')
    let blogImg = await createBlogImg({ img_id: img.id, blog_id, name })
    let blogImgAlt = await createBlogImgAlt({ blogImg_id: blogImg.id })
    ctx.body = new SuccModel({ ...blogImgAlt, img_id: img.id, url: img.url, hash})
}

module.exports = {
    uploadImg
}