const { 
    readImg,
    createImg
} = require('../server/img')

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
    let img = await readImg({hash}, { blog_id, name })
    img && console.log('@GCS有圖檔，僅作BlogImg關聯')
    if(!img){   //  若GCS沒有該圖檔，則 upload GCS
        let ress = await parse(ctx)
        let { blogImg: url } = ress
        img = await createImg({hash, url}, { blog_id, name })
        console.log('@GCS無圖檔，直接創建img且作BlogImg關聯')
    }
    ctx.body = new SuccModel(img)
}

module.exports = {
    uploadImg
}