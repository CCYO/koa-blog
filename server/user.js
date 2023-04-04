/**
 * @description Server User
 */
const { errRes, MyErr } = require('../model')
const { hash } = require('../utils/crypto')
const { User } = require('../db/mysql/model')  //  0404
const Init = require('../utils/init')           //  0404
//  0404
async function readList(opts) {
    let users = await User.findAll(opts)
    return Init.user(users)
}
//  0404
/** 創建 User
 * @param {object} param0
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @returns {object} object 除了 password 以外的 user 資料
 */
async function create(data) {
    try {
        const user = await User.create(data)
        return Init.user(user)
    } catch (err) {
        throw MyErr({ ...errRes.USER.CREATE, err})
    }
}
//  0404
/** 查找 User 資料
 * @param {{ id: number, email: string, password: string }} param0 
 * @param {number} param0.id - user id
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @return {} 無資料為null，反之，password 以外的 user 資料
 */
async function read(opts) {
    let user = await User.findOne(opts)
    return Init.user(user)
}





//  更新user數據
const updateUser = async ({ newData, id }) => {
    let data = { ...newData }
    if (data.hasOwnProperty('age')) {
        newData.age *= 1
    }
    if (data.hasOwnProperty('password')) {
        data.password = hash(data.password)
    }

    let user = await User.findByPk(id)
    console.log()
    user = await user.update(data)

    return Init.user(user)
}

module.exports = {
    //  0404
    readList,
    //  0404
    create,
    //  0404
    read,

    updateUser,     //  controller user
 
}