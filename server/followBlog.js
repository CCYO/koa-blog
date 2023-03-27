/**
 * @description ServePubScr*/
const { PubScr } = require('../db/mysql/model')

/** 刪除關聯    0322
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
 async function deleteFollows(data) {
    let datas = []
    if(Array.isArray(data)){
        datas = [...data]
    }else{
        datas = [data]
    }
    let keys = [ ...Object.keys(datas[0]), 'updatedAt']
    let follows = await PubScr.bulkCreate( datas, {
        updateOnDuplicate: [...keys]
    })
    if(datas.length !== follows.length){
        return false
    }
    return true
}
//  0322
async function createFollows(data) {
    let datas = []
    if(Array.isArray(data)){
        datas = [...data]
    }else{
        datas = [data]
    }
    datas = datas.map( item => ({ ...item, deletedAt: null }) )
    let keys = [ ...Object.keys(datas[0]), 'updatedAt']
    let follows = await PubScr.bulkCreate(datas, {
        updateOnDuplicate: [...keys]
    })
    if (datas.length !== follows.length) {
        return false
    }
    return true
}

async function readFollowers(opts) {
    let followers = await PubScr.findAll(opts)
    return followers.map( follower => follower.toJSON() )
}

async function hiddenBlog({where}) {
    // let { blog_id, confirm } = opts
    let opts = { where }
    let row = await PubScr.destroy(opts)
    if(!row){
        return false
    }
    return true
}

async function restoreBlog(opt_where) {
    let where = { ...opt_where }

    await PubScr.restore(where)
}





module.exports = {
    deleteFollows,     //  0228
    
    createFollows,
    restoreBlog,
    
    hiddenBlog,
    readFollowers,

    
}