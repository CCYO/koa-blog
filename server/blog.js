const {
    seq,
    Blog        //  0228
} = require('../db/mysql/model')

const { Op } = require('sequelize')

const Init = require('../utils/init')

/** 查詢 blogs   0324
 * @param {object} param0 查詢 blogs 紀錄所需的參數
 * @param {number} param0.user_id user id
 * @param {boolean} param0.getAll 是否無視 blog 公開/隱藏，false 僅拿公開，true 全拿
 * @returns {object} 
 *  [blog: {
 *      id, title, show, showAt,
 *      author: { id, email, nickname, age, avatar, avatar_hash }
 *  }]
 * 
 
 */
 async function readBlogs(opts) {
    let blogs = await Blog.findAll(opts)
    return init_blog(blogs)
}

/**批量刪除 0303
 * 
 * @param {*} blog_id 
 * @param {*} needComment 
 * @returns 
 */
async function deleteBlogs({ blogIdList, authorId: user_id }) {
    let [{affectedRows}] = await seq.getQueryInterface().bulkDelete('Blogs', {
        user_id,
        id: { [Op.in]: blogIdList }
    })
    
    if(affectedRows !== blogIdList.length ){
        return false
    }
    return true
}

//  0228
async function readBlog(opts) {
    let blog = await Blog.findOne(opts)
    return Init.blog(blog)
}

/** 創建Blog    0303
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function createBlog({ title, user_id }) {
    let blog = await Blog.create({ title, user_id })
    return init_blog(blog)
}

/** 更新blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {number} 1代表更新成功，0代表失敗
 */
async function updateBlog({blog_id: id, newData}) {
    let [row] = await Blog.update(newData, {
        where: { id }
    })
    if(row){
        return true
    }
    return false
}

module.exports = {
    updateBlog,

    deleteBlogs,
    createBlog,         //  0303
    readBlog,           //  0228
    readBlogs          //  0228
}
