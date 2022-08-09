/**
 * @description Server FollowBlog
 */

const { Op } = require('sequelize')

const { FollowBlog } = require('../db/mysql/model')

/** 刪除關聯
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function deleteFollower({follower_id, blog_id}) {
    let where = { follower_id }
    let isArray = Array.isArray(blog_id)
    if(isArray){
        where.blog_id = {[Op.in]: blog_id}
    }else{
        where.blog_id = blog_id
    }
    const num = await FollowBlog.destroy({
        where,
        force: true
    })

    if ((isArray && blog_id.length !== num) || (!isArray && !num) ){
        return false
    } 
    return true
}

module.exports = {
    deleteFollower
}