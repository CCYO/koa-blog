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
async function deleteFollower({ follower_id, blog_id }) {
    let where = { follower_id }
    let isArray = Array.isArray(blog_id)
    if (isArray) {
        where.blog_id = { [Op.in]: blog_id }
    } else {
        where.blog_id = blog_id
    }
    const num = await FollowBlog.destroy({
        where,
        force: true
    })

    if ((isArray && blog_id.length !== num) || (!isArray && !num)) {
        return false
    }
    return true
}

async function createFollowers({ blog_id, listOfFollowerId, opts}) {
    let data = listOfFollowerId.map(follower_id => ({ blog_id, follower_id }))
    let res = await FollowBlog.bulkCreate(data, opts)
    if (listOfFollowerId.length !== res.length) {
        throw new Error('創建/更新FollowBlog失敗')
    }
    return true
}

async function hiddenBlog(opt_where) {
    // let { blog_id, confirm } = opts
    let where = { ...opt_where }

    let row = await FollowBlog.destroy({ where })
    return row
}

async function restoreBlog(opt_where) {
    let where = { ...opt_where }

    await FollowBlog.restore(where)
}

async function updateFollowBlog(newData, opt_where, options) {
    let where = { ...opt_where }
    let opts = { where, ...options }
    const [row] = await FollowBlog.update(newData, opts)
    return row
}

async function readFollowers({ where, attributes }) {
    let opts = { where }
    if (attributes) {
        opts.attributes = attributes
    }

    let followers = await FollowBlog.findAll(opts)

    return followers.map( follower => follower.toJSON() )
}

module.exports = {
    createFollowers,
    restoreBlog,
    deleteFollower,
    hiddenBlog,
    updateFollowBlog,
    readFollowers
}