const {
    createBlog, updateBlog: updateBlog_S,
    readImg,
    createImg,
    img_associate_blog
} = require('../server/editor')

const { upload_blogImg_to_GCS } = require('../utils/upload_2_GCS_by_formidable')

const { SuccModel, ErrModel } = require('../model')
const {
    BLOG
} = require('../model/errRes')
//  (2) (3)
//  使用時機：進入富文本編輯器 & 填完標題
//  請求data：{ name: 標題名稱 } & session.user.id
//  響應data：{ id: blogIns.id }
/**
 * @description 初次建立 blog & 與 user 建立連結
 * @param { String } title 標題
 * @param { Number } userId 使用者ID  
 * @returns
 *  SuccModel for { data: { id: blog.id }} || ErrModel
 */
async function addBlog(title, userId) {
    try {
        const blog = await createBlog(title, userId)
        return new SuccModel({ id: blog.id })
    } catch (e) {
        console.log('@創建Blog時發生錯誤 => ', e)
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}

async function updateBlog(data, blog_id) {
    const raw = await updateBlog_S(data, blog_id)
    if (raw) {
        return new SuccModel()
    } else {
        return new ErrModel()
    }
}

/**
 * @description 找尋 DB 內使否曾有存入過此圖片
 * @param {String} img_hash 圖片hash值
 * @returns {Object} 回傳 { hash, url }
 */
async function findImg(img_hash) {
    const img = await Img.findOne({
        where: { hash: img_hash },
        attributes: ['hash', 'url'],
        raw: true
    })
    if (img) {
        return { id: img.id, hash: img.hash, url: img.url }
    } else {
        return false
    }
}

// (4) (5) (6)
/**
 * @description upload imgage 使用
 * @param { Number } blog_id
 * @param { String } img_hash
 * @returns { Number } blogImg.id
 */
async function uploadImg(ctx) {
    try {
        let { hash, blog_id } = ctx.params
        //  確認 SQL 是否有此圖片的紀錄
        let img = await readImg({ hash })
        //  若無值，則 upload to GCE
        if (!img) {
            // upload img to GCE
            let url = await upload_blogImg_to_GCS(ctx)
            //  Img Table 建檔，且與 Blog 建立關聯
            img = await createImg({ url, hash })
        }
        //  若有值，與 Blog 建立關聯
        let blogImg_id = await img_associate_blog(img.id, blog_id)
        return new SuccModel({...img, blogImg_id: blogImg_id})
    } catch (e) {
        console.log('UPLOAD BLOG IMG ERR => ', e)
        return new ErrModel({ ...BLOG.UPLOAD_IMG_ERR, msg: e })
    }
}



module.exports = {
    addBlog,
    updateBlog,
    uploadImg
}