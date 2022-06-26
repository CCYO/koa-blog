const xss = require('xss')

const {
    updateBlog: updateBlog_S,
    
    deleteBlogImg,
    
    deleteBlog
} = require('../server/editor')

const { readImg, readImgAndAssociateWidthBlog } = require('../server/img')

const { upload_jpg } = require('../utils/gcs')

const { upload_blogImg_to_GCS } = require('../utils/upload_2_GCS_by_formidable')

const { SuccModel, ErrModel } = require('../model')
const {
    BLOG
} = require('../model/errRes')


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

async function removeBlog(id){
    const res = await deleteBlog(id)
    if(res) return new SuccModel('BLOG已成功刪除')
    return new ErrModel(BLOG.BLOG_REMOVE_ERR)
}

module.exports = {

 
 
    removeBlog
}