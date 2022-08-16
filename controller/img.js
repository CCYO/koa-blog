const { 
    readImg,

    createImgAndAssociateWidthBlog,
} = require('../server/img')

const { upload_jpg } = require('../utils/gcs')

const { SuccModel, ErrModel } = require('../model')

/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
 async function uploadImg(ctx, createBlogImg = true) {
    let { blog_id, hash } = ctx.query
    //  查找img紀錄，若有則代表GCS內已有圖檔，直接將該img紀錄與blog作連結
    let img = await readImg({hash, blog_id, createBlogImg})
    
    if(!img){
        //  若GCS沒有該圖檔，則 upload GCS
        let url = await upload_jpg(ctx)
        //  在DB建立Img紀錄，並與blog作關聯
        img = await createImgAndAssociateWidthBlog({hash, url}, blog_id)
        img = { ...img, hash }
    }

    
    
    return new SuccModel(img)
}

module.exports = {
    uploadImg
}