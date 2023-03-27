const {
    seq,
    Blog        //  0228
} = require('../db/mysql/model')

const { Op } = require('sequelize')

const Init = require('../utils/init')

/**批量刪除 0327
 * 
 * @param {*} blog_id 
 * @param {*} needComment 
 * @returns 
 */
async function deleteBlogs(datas) {
    try{
        for(data of datas){
            let row = await Blog.destroy({
                where: { ...data }
            })
            if(!row){
                throw new Error()
            }
        }
    }catch(e){
        return false
    }
    return true
}
/** 更新blog    //  0326
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {number} 1代表更新成功，0代表失敗
 */
async function updateBlog({ blog_id, newData }) {
    let [row] = await Blog.update(newData, {
        where: { id: blog_id }
    })
    if (row) {
        return true
    }
    return false
}
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
    return Init.blog(blogs)
}

//  0228
async function readBlog(opts) {
    let blog = await Blog.findOne(opts)
    console.log('x => ', blog)
    return Init.blog(blog)
}

/** 創建Blog    0303
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function createBlog({ title, authorId }) {
    let blog = await Blog.create({ title, user_id: authorId })
    return Init.blog(blog)
}

module.exports = {
    deleteBlogs,        //  0327
    updateBlog,         //  0326
    createBlog,         //  0303
    readBlog,           //  0228
    readBlogs,          //  0228
}
