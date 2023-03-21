/**
 * @description Server FollowBlog
 */

const { Op } = require('sequelize')

const {
    seq,        //  0228
    FollowBlog
} = require('../db/mysql/model')

async function createFollows(objs) {
    let datas = []
    if(Array.isArray(objs)){
        datas = [...objs]
    }else{
        datas = [objs]
    }
    
    console.log(datas)
    
    datas = datas.map( data => ({ ...data, deletedAt: null }) )
    let keys = Object.keys(datas[0])
    console.log(keys)
    let follows = await FollowBlog.bulkCreate(datas, {
        updateOnDuplicate: [...keys]
    })
    if (datas.length !== follows.length) {
        return false
    }
    return true
}

async function readFollowers(opts) {
    let followers = await FollowBlog.findAll(opts)
    return followers.map( follower => follower.toJSON() )
}

/** 刪除關聯    0228
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function deleteFollow(ids, time) {
    let datas = []
    if(Array.isArray(ids)){
        datas = [...ids]
    }else{
        datas = [ids]
    }
    datas = ids.map( id => ({ id, deletedAt: time }) )
    let follows = await FollowBlog.bulkCreate( datas, {
        updateOnDuplicate: ['id', 'deletedAt'],
        // paranoid: false
    })
    console.log('#follows => ', follows)
    let x = await FollowBlog.findByPk(ids[0])
    console.log('x => ',x)
    if(datas.length !== follows.length){
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
    deleteFollow,     //  0228
    
    createFollows,
    restoreBlog,
    
    hiddenBlog,
    updateFollowBlog,
    readFollowers,

    
}