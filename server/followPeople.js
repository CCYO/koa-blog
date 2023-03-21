/**
 * @description Server FollowPeople
 */

const {
    FollowPeople    //  0228
} = require('../db/mysql/model')


/** 刪除 Follow_People 紀錄 0228
 * 
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
 async function deleteFollow(objs, time) {
    let datas = []
    if(Array.isArray(objs)){
        datas = [...objs]
    }else{
        datas = [objs]
    }
    
    
    console.log('@ datas => ', datas)
    
    datas = datas.map( data => ({ ...data, deletedAt: time }) )
    let keys = Object.keys(datas[0])
    console.log('@keys => ', keys)
    let follows = await FollowPeople.bulkCreate( datas, {
        updateOnDuplicate: [...keys]
    })
    console.log('@follows => ', follows)
    
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
async function createFollow({ idol_id, fans_id }) {
    const follow = await FollowPeople.bulkCreate([{ idol_id, fans_id, deletedAt: null}], {updateOnDuplicate: ['idol_id', 'fans_id', 'deletedAt']})
    console.log('@createFollowPeople => ', follow)
    if (!follow) return false
    return true
}

async function readFans(opts_where) {
    let where = { ...opts_where }
    let res = await FollowPeople.findAll({
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
    let res = await FollowPeople.findAll({
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
    deleteFollow,
    createFollow,

    readFans,        //  server cache
    readIdols,
}