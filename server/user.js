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

async function _readUser({ id, email, password }){
    if (!id && !email && !password){
        return null
    }

    const where = {}
    
    if (id) where.id = id
    if (email) where.email = email
    if (password) where.password = hash(password)

    const user = await User.findOne({ 
        where,
        attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash']
    })
    if (!user) return null
    
    return init_user(user)
}




/** 查找 Fans
 * @param {string} idol_id 
 * @returns {array} arrItem 代表 fans，若數組為空，表示沒粉絲
 */
async function readFans(opts) {
    // let opts = { where }
    // if(attributes){
    //     opts.attributes = attributes
    // }
    // const idol = await User.findByPk(idol_id)
    
    // let attributes = ['id', 'email', 'age', 'nickname', 'avatar', 'avatar_hash']
    // if(opt_attr){
    //     attributes = [...opt_attr]
    // }
    const user = await User.findOne(opts)
    console.log(user.toJSON())
    if(user){FollowPeople_F
        const { FollowPeople_F } = user.toJSON()

    }
    
    return init_user(FollowPeople_F)

    // const fansList = await FollowPeople.findAll(opts) //idol.getFollowPeople_F({ attributes })

    if (!fansList.length) return []

    return init_user(fansList)
}

/** 查找 Idols
 * @param {string} fans_id 
 * @returns {array} arrItem 代表 idol，若數組為空，表示沒偶像
 */
async function readIdols(opts) {
    const user = await User.findOne(opts)
    const { FollowPeople_I } = user.toJSON()
    return init_user(FollowPeople_I)




    const fans = await User.findByPk(fans_id)

    const idolList = await fans.getFollowPeople_I({
        attributes: ['id', 'email', 'age', 'nickname', 'avatar', 'avatar_hash']
    })

    if (!idolList.length) return []
    return init_user(idolList)
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
    
    user = await user.update(data)
    
    return init_user(user)
}

module.exports = {
    readFans,       //  controller user
    readIdols,      //  controller user
    updateUser,     //  controller user

    createUser,     //  0228
    readUsers,      //  0304
    readUser        //  0228
}