/**
 * @description Server FollowBlog
 */

const { Op } = require('sequelize')

const {
    seq,        //  0228
    FollowBlog
} = require('../db/mysql/model')

async function readFollowers(opts) {
    let followers = await FollowBlog.findAll(opts)
    return followers.map( follower => follower.toJSON() )
}

/** 刪除關聯    0228
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function deleteFollower({ follower_id, blogIdList }) {
    let [{affectedRows}] = await seq.getQueryInterface().bulkDelete('FollowBlogs', {
        blog_id: { [Op.in]: blogIdList },
        follower_id
    })
    
    if(affectedRows !== blogIdList.length ){
        return false
    }
    return true
}

async function createFollowers({ blog_id, listOfFollowerId, updateData, opts}) {
    let dataList = listOfFollowerId.map(follower_id => {
        let data = { blog_id, follower_id }
        if(updateData){
            data = { ...data, ...updateData }
        }
    })
    let res = await FollowBlog.bulkCreate(dataList, opts)
    if (dataList.length !== res.length) {
        return false
    }
    return true
}

async function hiddenBlog({where}) {
    // let { blog_id, confirm } = opts
    let opts = { where }
    let row = await FollowBlog.destroy(opts)
    if(!row){
        return false
    }
    return true
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



module.exports = {
    createFollowers,
    restoreBlog,
    
    hiddenBlog,
    updateFollowBlog,
    readFollowers,

    deleteFollower,     //  0228
}