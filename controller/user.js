/**
 * @description Controller user相關
 */

const CommentController = require('./comment')
const BlogController = require('./blog')    //  0309
const { init_user } = require('../utils/init')          //  0228
const {
    CACHE: {
        TYPE: {
            PAGE,   //  0228
            NEWS    //  0228
        }
    }
} = require('../conf/constant')


const User = require('../server/user')                  //  0228
const { ErrModel, SuccModel } = require('../model')     //  0228
const Opts = require('../utils/seq_findOpts')           //  0228

const {
    FOLLOW,             //  0304
    LOGIN,              //  0304
    FOLLOWBLOG,         //  0228
    READ,               //  0228
    REGISTER: {
        NO_PASSWORD,    //  0228
        NO_EMAIL,       //  0228
        IS_EXIST,       //  0228
    },
} = require('../model/errRes')
const FollowBlog = require('../server/followBlog')      //  0228
const { Blog } = require('../db/mysql/model')

//  更新user    0309
async function modifyUserInfo(newData, userId) {
    let cache = { [PAGE.USER]: [userId] }
    if (newData.nickname || newData.email || newData.avatar) {
        let resModel = await findRelationShip(userId)
        if (resModel.errno) {
            return resModel
        }
        let { fansList, idolList } = resModel.data
        let people = [...fansList, ...idolList].map(({ id }) => id)

        let { data: blogs } = await BlogController.findBlogListByUserId(userId, { beOrganized: false })
        let blogList = blogs.map(({id}) => id)
        //  找出曾留過言的Blog
        await CommentController.findBlogsOfhasBeenComment(user_id)
        cache[NEWS] = people
        cache[PAGE.USER] = [...cache[PAGE.USER], ...people]
        cache[PAGE.BLOG] = blogList
    }
    let user = await User.updateUser({ newData, id: userId })
    return new SuccModel({ data: user, cache })
}
//  0322
async function findRelationShip(userId) {
    let userRes = await findUser(userId)
    if (userRes.errno) {
        return userRes
    }
    let { data: currentUser } = userRes
    let { data: idolList } = await _findIdols(userId)
    let { data: fansList } = await _findFans(userId)
    let data = { currentUser, idolList, fansList }
    return new SuccModel({ data })
}
//  0304
async function _findIdols(fans_id) {
    // user: { id, FollowPeople_I: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.USER.findIdols(fans_id))
    let idols = user ? init_user(user.FollowPeople_I) : []
    return new SuccModel({ data: idols })
}
//  0304
async function _findFans(idol_id) {
    // user: { id, FollowPeople_F: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.USER.findFans(idol_id))
    let fans = user ? init_user(user.FollowPeople_F) : []
    return new SuccModel({ data: fans })
}
//  0304
async function findUser(id) {
    const user = await User.readUser(Opts.USER.findUser(id))
    if (!user) {
        return new ErrModel(READ.NOT_EXIST)
    }
    return new SuccModel({ data: user })
}
/** 登入 user   0228
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
async function login(email, password) {
    if (!email || !password) {
        return new ErrModel(LOGIN.DATA_IS_INCOMPLETE)
    }
    const user = await User.readUser(Opts.USER.login({ email, password }))
    if (!user) {
        return new ErrModel(LOGIN.NO_USER)
    }
    return new SuccModel({ data: user })
}
/** 註冊 0228
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
async function register(email, password) {
    if (!password) {
        return new ErrModel(NO_PASSWORD)
    } else if (!email) {
        return new ErrModel(NO_EMAIL)
    }

    const checkModel = await isEmailExist(email)

    if (checkModel.errno) {
        return checkModel
    }

    const user = await User.createUser({ email, password })
    return new SuccModel({ data: user })
}
/** 確認信箱是否已被註冊 0228
 * @param {string} email 信箱 
 * @returns {object} resModel
 */
async function isEmailExist(email) {
    const exist = await User.readUser(Opts.USER.isEmailExist(email))
    if (exist) {
        return new ErrModel(IS_EXIST)
    }
    return new SuccModel()
}

module.exports = {
    findRelationShip,

    modifyUserInfo,             //  0309
    findUser,                   //  0303
    register,                   //  0228
    login,                      //  0228
    isEmailExist                //  0228
}