const { CACHE: { TYPE: { PAGE } } } = require('../conf/constant')
const Controller_BlogImgAlt = require('./blogImgAlt')
const { BLOG: { UPLOAD_IMG_ERR } } = require('../model/errRes')
const Controller_BlogImg = require('../controller/blogImg')
const Opts = require('../utils/seq_findOpts')
const Img = require('../server/img')
const {
    readImg,
    createImg
} = require('../server/img')

const { parse } = require('../utils/gcs')

const { SuccModel, ErrModel } = require('../model')

async function uploadImgToBlog({ url, hash, name, blog_id }) {
    //  尋找img
    let { data: img } = await findImgThenEditBlog(hash)
    //  img不存在，新建img
    if (!img) {
        //  創建img
        let res_img = await addImg({ hash, url })
        if (!res_img.errno) {
            return res_img
        }
        let { data: img } = res_img
    }
    let img_id = img.id
    let res = await associateWithBlog({ img_id, blog_id, name })
    if(res.errno){
        return res
    }
    // let { blog_id, blogImg_id, name, alt_id, alt } = res.data
    let data = { img_id, hash, url, ...res.data }
    return new SuccModel({ data, cache: { [PAGE.BLOG]: blog_id } })
}

async function associateWithBlog({ img_id, blog_id, name }) {
    //  與blog作連結
    //  創建blogImg
    let res_blogImg = await Controller_BlogImg.createBlogImg({ blog_id, img_id, name })
    if (res_blogImg.errno) {
        return res_blogImg
    }
    let { id: blogImg_id } = res_blogImg.data
    //  創建blogImgAlt
    let res_blogImgAlt = await Controller_BlogImgAlt.addBlogImgAlt({ blogImg_id })
    if (res_blogImgAlt.errno) {
        return res_blogImgAlt
    }
    let { id: alt_id, alt } = res_blogImgAlt.data
    let data = {
        blog_id, blogImg_id, name, alt_id, alt
    }
    return new SuccModel({data})
}

async function addImg({ hash, url }) {
    let img = await Img.createImg({ hash, url })
    if (!img) {
        return new ErrModel(UPLOAD_IMG_ERR)
    }
    return new SuccModel({ data: img })
}

async function findImgThenEditBlog(hash) {
    //  找img
    let img = await Img.readImg(Opts.IMG.findImgThenEditBlog(hash))
    return new SuccModel({ data: img })
}

/**
 * 上傳圖檔至GCS
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
async function uploadImg(ctx, next) {
    let { blog_id, hash } = ctx.query
    //  查找img紀錄，若有則代表GCS內已有圖檔，直接將該img紀錄與blog作連結
    let img = await readImg({ hash }, blog_id)
    img && console.log('@GCS有圖檔，僅作BlogImg關聯')
    if (!img) {   //  若GCS沒有該圖檔，則 upload GCS
        let { blogImg: url } = await parse(ctx)
        img = await createImg({ hash, url }, blog_id)
        console.log('@GCS無圖檔，直接創建img且作BlogImg關聯')
    }

    ctx.body = new SuccModel(img)
}

module.exports = {
    associateWithBlog,
    addImg,
    findImgThenEditBlog,
    uploadImgToBlog,
    uploadImg
}