/**
 * @description Server User
 */

const {
    User            //  0228
} = require('../db/mysql/model')

const  { hash }  = require('../utils/crypto')

const { init_user } = require('../utils/init')


/** 創建 User   0228
 * @param {object} param0
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @returns {object} object 除了 password 以外的 user 資料
 */
const createUser = async ({ password, ...opts }) => {
    let data = { ...opts }
    data.password = hash(password)
    
    const user = await User.create(data)
    return init_user(user)
}

async function readUsers(opts){
    let users = await User.findAll(opts)
    return init_user(users)
}

/** 查找 User 資料  0228
 * @param {{ id: number, email: string, password: string }} param0 
 * @param {number} param0.id - user id
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @return {} 無資料為null，反之，password 以外的 user 資料
 */
async function readUser(opts){
    let user = await User.findOne(opts)
    return init_user(user)
}

//  更新user數據
const updateUser = async ({newData, id}) => {
    let data = { ...newData }
    if(data.hasOwnProperty('age')){
        newData.age *= 1
    }
    if (data.hasOwnProperty('password')) {
        data.password = hash(data.password)
    }

    let user = await User.findByPk(id)
    console.log()
    user = await user.update(data)
    
    return init_user(user)
}

module.exports = {
    
    updateUser,     //  controller user

    createUser,     //  0228
    readUsers,      //  0304
    readUser        //  0228
}