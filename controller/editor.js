const xss = require('xss')

const {
    createBlog, updateBlog: updateBlog_S,
    readImg,
    createImg,
    img_associate_blog,
    deleteBlogImg,
    readImg_associateBlog,
    createImg_associateBlog,
    deleteBlog
} = require('../server/editor')

const { upload_jpg } = require('../utils/gcs')

const { upload_blogImg_to_GCS } = require('../utils/upload_2_GCS_by_formidable')

const { SuccModel, ErrModel } = require('../model')
const {
    BLOG
} = require('../model/errRes')
//  (2) (3)
//  使用時機：進入富文本編輯器 & 填完標題
//  請求data：{ name: 標題名稱 } & session.user.id
//  響應data：{ id: blogIns.id }


async function updateBlog(blog_id, data, remove_imgs) {
    if(data.title){
        data.title = xss(data.title)
    }
    if(data.html){
        data.html = xss(data.html)
    }

    let row = await updateBlog_S(data, blog_id)
    
    if(!row){
        return new ErrModel(BLOG.NO_UPDATE)
    }
    if(!remove_imgs){
        return new SuccModel()
    }
    
    let res = await deleteBlogImg(remove_imgs)
    if(res){
        return new SuccModel()
    }else{
        return new ErrModel(BLOG.IMAGE_REMOVE_ERR)
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
    let { img_hash: hash, blog_id: id } = ctx.params
    //  確認 img 的 SQL 紀錄，若有直接與 blog 作關聯
    let img = await readImg_associateBlog({hash}, id)
    //  若沒有，則 upload GCS
    if(!img){
        img = await upload_jpg(ctx)
        img = await createImg_associateBlog({...img}, id)
    }
    console.log('@res => ', img)
    return new SuccModel(img)
}

async function removeBlog(id){
    const res = await deleteBlog(id)
    if(res) return new SuccModel('BLOG已成功刪除')
    return new ErrModel(BLOG.BLOG_REMOVE_ERR)
}

module.exports = {

    updateBlog,
    uploadImg,
    removeBlog
}