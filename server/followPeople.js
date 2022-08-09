/**
 * @description Server FollowPeople
 */

const { FollowPeople } = require('../db/mysql/model')

/** 新增 Fans
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function addFans(idol_id, fans_id) {
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
async function deleteFans(idol_id, fans_id) {
    const num = await FollowPeople.destroy({ where: { idol_id, fans_id } })

    if (!num) return false
    return true
}

module.exports = {
    addFans,
    deleteFans
}