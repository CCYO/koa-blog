/**
 * @description Server IdolFans
 */

const {
    IdolFans    //  0228
} = require('../db/mysql/model')


/** 刪除 Follow_People 紀錄 0228
 * 
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
    let follows = await IdolFans.bulkCreate( datas, {
        updateOnDuplicate: [...keys]
    })
    
    if(datas.length !== follows.length){
        return false
    }
    return true
}

/** 新增 Fans   0228
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function createFollow(data) {
    let datas = []
    if(Array.isArray(data)){
        datas = [...data]
    }else{
        datas = [data]
    }
    
    datas = datas.map( item => ({ ...item, deletedAt: null }) )
    let keys = [ ...Object.keys(datas[0]), 'updatedAt']
    const follows = await IdolFans.bulkCreate(datas, {
        updateOnDuplicate: [...keys]
    })
    if (datas.length !== follows.length) {
        return false
    }
    return true
}

async function readFans(opts_where) {
    let where = { ...opts_where }
    let res = await IdolFans.findAll({
        attributes: ['fans_id'],
        where
    })

    if (!res.length) {
        return []
    }

    let fansList = res.map(item => {
        let { fans_id } = item.toJSON()
        return fans_id
    })

    return fansList
}

async function readIdols(opts_where) {
    let where = { ...opts_where }
    let res = await IdolFans.findAll({
        attributes: ['idol_id'],
        where
    })

    if (!res.length) {
        return []
    }

    let idolList = res.map(item => {
        let { idol_id } = item.toJSON()
        return idol_id
    })

    return idolList
}

module.exports = {
    deleteFollows,
    createFollow,

    readFans,        //  server cache
    readIdols,
}