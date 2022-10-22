/**
 * @description Server FollowPeople
 */

const { FollowPeople, FollowBlog } = require('../db/mysql/model')

/** 新增 Fans
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function addFans({ idol_id, fans_id }) {
    const follow = await FollowPeople.create({ idol_id, fans_id })

    if (!follow) return false
    return true
}

/** 刪除 Follow_People 紀錄
 * 
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function deleteFans({ idol_id, fans_id }) {
    const num = await FollowPeople.destroy({ where: { idol_id, fans_id } })

    if (!num) return false
    return true
}

async function readFans(opts_where) {
    let where = {...opts_where}
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
    let where = {...opts_where}
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
    addFans,        //  controller user
    deleteFans,     //  controller user
    readFans,        //  server cache
    readIdols
}