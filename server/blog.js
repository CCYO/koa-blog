const {
    //  0406 
    ErrRes,
    //  0406
    MyErr
} = require('../model')           //  0406
const Init = require('../utils/init')           //  0404
const { Blog } = require('../db/mysql/model')   //  0404
//  0411
/**批量刪除
 * 
 * @param {*} blog_id 
 * @param {*} needComment 
 * @returns 
 */
async function deleteList(opts) {
    try {
        //  RV row
        return await Blog.destroy(opts)
    } catch (err) {
        throw new MyErr({ ...ErrRes.BLOG.DELETE.ERR, err })
    }
}
//  0409
/** 更新blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {number} 1代表更新成功，0代表失敗
 */
 async function update(id, data) {
    let [row] = await Blog.update(data, { where: { id } })
    if (!row) {
        throw new MyErr(ErrRes.BLOG.UPDATE)
    }
    return row
}
//  0406
async function read(opts) {
    let blog = await Blog.findOne(opts)
    return Init.blog(blog)
}
//  0406
/** 創建Blog
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function create(data) {
    try {
        let blog = await Blog.create(data)
        return Init.blog(blog)
    }catch(err){
        throw new MyErr({ ...ErrRes.BLOG.CREATE, err})
    }
}
//  0404
/** 查詢 blogs
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
async function readList(opts) {
    let blogs = await Blog.findAll(opts)
    return Init.blog(blogs)
}

module.exports = {
    //  0411
    deleteList,
    //  0409
    update,
    //  0406
    read,
    //  0406
    create,
    //  0404
    readList
}








