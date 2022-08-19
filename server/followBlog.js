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

async function createFollowers({blog_id, listOfFollowerId}){
    let data = listOfFollowerId.map( follower_id => ({ blog_id, follower_id}))
    let res = await FollowBlog(data)
    return res
}

async function hiddenBlog({ blog_id }) {
    let row = await FollowBlog.destroy({ where: { blog_id, confirm: false } })
    return row
}

async function updateFollowBlog(data, options) {
    options = { ...options, paranoid: false }
    const [row] = await FollowBlog.update(data, options)
    return row
}

async function readFollowers({ blog_id, onlyId = true }) {
    let res = await FollowBlog.findAll({
        attributes: ['follower_id'],
        where: { blog_id },
    })

    if (!res.length) {
        return []
    }

    let followerList = res.map(item => {
        let { follower_id } = item.toJSON()

        return follower_id
    })

    return followerList
}

module.exports = {
    deleteFollower,
    createFollowers,
    hiddenBlog,
    updateFollowBlog
}