/**
 * @description Controller user相關
 */
 const Init = require('../utils/init')          //  0324

const CommentController = require('./comment')
const BlogController = require('./blog')    //  0309

const {
    CACHE: {
        TYPE: {
            API,
            PAGE,   //  0228
            NEWS    //  0228
        }
    }
} = require('../conf/constant')


const User = require('../server/user')                  //  0228
const { ErrModel, SuccModel, MyErr } = require('../model')     //  0228
const Opts = require('../utils/seq_findOpts')           //  0228

const {
    LOGIN,              //  0304
    READ,               //  0228
    REGISTER: {
        NO_PASSWORD,    //  0323
        NO_EMAIL,       //  0323
        IS_EXIST,       //  0323
    },
} = require('../model/errRes')

async function findOthersInSomeBlogAndPid({commenter_id, p_id, blog_id, createdAt}){
    //  [ { id, nickname, email, comments: [id, ...] }, ... ]
    let commenters = await User.readUsers(Opts.USER.findOthersInSomeBlogAndPid({commenter_id, p_id, blog_id, createdAt}))
    return new SuccModel({ data: commenters })
}
//  0324
async function findInfoForUserPage(userId) {
    //  向 DB 撈取數據  
    let resModel = await findRelationShip(userId)
    if (resModel.errno) {
        return resModel
    }
    //  DB 沒有相符數據
    let { data: { currentUser, fansList, idolList } } = resModel
    //  向 DB 撈取數據
    let { data: blogList } = await BlogController.findBlogsForUserPage(userId)
    let data = { currentUser, fansList, idolList, blogList }
    return new SuccModel({ data })
}

//  0324
async function findRelationShip(userId) {
    let userRes = await findUser(userId)
    if (userRes.errno) {
        return userRes
    }
    let { data: currentUser } = userRes
    let { data: idolList } = await _findIdols(userId)
    let { data: fansList } = await findFans(userId)
    let data = { currentUser, idolList, fansList }
    return new SuccModel({ data })
}
//  0324
async function _findIdols(fans_id) {
    // user: { id, FollowPeople_I: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.USER.findIdols(fans_id))
    let idols = user ? Init.user(user.idols) : []
    return new SuccModel({ data: idols })
}
//  0324
async function findFans(idol_id) {
    // user: { id, FollowPeople_F: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.USER.findFans(idol_id))
    let fans = user ? Init.user(user.fans) : []
    return new SuccModel({ data: fans })
}
//  0324
async function findUser(id) {
    const user = await User.readUser(Opts.USER.findUser(id))
    if (!user) {
        return new ErrModel(READ.NOT_EXIST)
    }
    return new SuccModel({ data: user })
}
/** 註冊 0323
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
    const data = await User.createUser({ email, password })
    return new SuccModel({ data })
}
/** 確認信箱是否已被註冊 0323
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
        let blogList = blogs.map(({ id }) => id)
        //  找出曾留過言的Blog
        let { data: blogsIncludeUsersComments } = await CommentController.findBlogsOfCommented(userId)

        cache[NEWS] = people
        cache[PAGE.USER] = [...cache[PAGE.USER], ...people]
        cache[PAGE.BLOG] = blogList
        cache[API.COMMENT] = blogsIncludeUsersComments
    }
    let user = await User.updateUser({ newData, id: userId })
    return new SuccModel({ data: user, cache })
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
module.exports = {
    findOthersInSomeBlogAndPid, //  0328
    register,                   //  0323
    isEmailExist,               //  0323

    findInfoForUserPage,        //  0323
    modifyUserInfo,             //  0309
    findRelationShip,           //  0322
    findFans,                   //  0326
    findUser,                   //  0303
    login,                      //  0228
}