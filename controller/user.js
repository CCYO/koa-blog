/**
 * @description Controller user相關
 */
const moment = require('moment')
const ejs = require('ejs')
const { resolve } = require('path')

const {
    createUser,
    readUser,
    readFansByUserId,
    readIdolsByUserId,

    readBlogListAndAuthorByUserId,
    readUserAndFollowReationByUserId,

    update,
    addFans, deleteFans,
    readNews, updateFollow,
    readOther,
    confirmNews,
    UnconfirmNewsCount,
    readMoreNewsAndConfirm
} = require('../server/user')

const {
    readBlogList,

    
    readBlogsByUserId,
    
} = require('../server/blog')

const {
    FollowBlog,

    updateBlogFansComfirm,
    updateFollowComfirm
} = require('../server/news')

const { validate_register } = require('../validator')
const hash = require('../utils/crypto')
const { ErrModel, SuccModel } = require('../model')


const {
    REGISTER: {
        UNEXPECTED,
        IS_EXIST,
        NO_EMAIL,
        NO_PASSWORD
    },
    READ,
    UPDATE,
    FOLLOW
} = require('../model/errRes')

/**
 * 確認信箱是否已被註冊
 * @param {string} email user 的信箱 
 * @returns {object} SuccessMode || ErrModel Instance
 */
async function isEmailExist(email) {
    const res = await readUser({ email })

    if (!res) {
        return new SuccModel('此帳號仍未被使用，歡迎註冊')
    } else {
        return new ErrModel(IS_EXIST)
    }
}

/**
 * 註冊
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
const register = async (email, password) => {
    if (!password) {
        return new ErrModel(NO_PASSWORD)
    }

    const { errno } = await isEmailExist(email)

    if (!errno) {
        const user = await createUser({email,password})
        return new SuccModel(user)

    } else {
        return new ErrModel(IS_EXIST)
    }
}

/**
 * 查找 user 資料
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns SuccessModel | ErrModel Instance，內部為 user 除了 password 以外的資料
 */
const findUser = async (email, password) => {
    const res = await readUser({ email, password })
        if (res) return new SuccModel(res)
        return new ErrModel(READ.NOT_EXIST)
}

//  取得 Idol fans 以及自己公開/隱藏的blog
async function getSelfInfo(id) {
    let blogList = await readBlogsByUserId(id)
    let fansList = await readFansByUserId(id)
    let idolsList = await readIdolsByUserId(id)

    let blogs = { show: [], hidden: [] }
    //  處理 blogs
    if(blogList.length){
        blogList.forEach( item => {
            let {blog: {show}} = item
            show && blogs.show.push(item) || blogs.hidden.push(item)
        })
    }

    return new SuccModel({ blogList: blogs, fansList, idolsList})
}

/**
 * 取得 user id 自己的資料，以及 偶像、粉絲 資料
 * @param {number} user_id 
 * @returns {object}
 * {
 *  currentUser,
 *  fansList: [ user, ...],
 *  idolList: [ user, ...]
 * }
 */
async function getPeopleById(user_id){
    let currentUser = await readUser({ id: user_id })
    let fansList = await readFansByUserId(user_id)
    let idolList = await readIdolsByUserId(user_id)
    return new SuccModel({ currentUser, fansList, idolList})
}

/**
 * 追蹤
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function followIdol(fans_id, idol_id) {
    const res = await addFans(idol_id, fans_id)
    if (res) return new SuccModel(res)
    return new ErrModel(FOLLOW.FOLLOW_ERR)
}

/**
 * 取消追蹤
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
async function cancelFollowIdol(fans_id, idol_id) {
    const res = await deleteFans(idol_id, fans_id)
    //  也要將FollowBlog紀錄刪除

    //  先找出 idol 的文章
    let blogList = await readBlogList({user_id: idol_id, getAll: true})
    let blogList_id = []
    if(blogList.length){
        blogList.forEach(({id}) => blogList_id.push(id))
    }
    //  刪除關聯
    await FollowBlog.deleteBlog({blogList_id, follower_id: fans_id})
    if (res) return new SuccModel()
    return new ErrModel(FOLLOW.CANCEL_ERR)
}


async function getFansById(idol_id) {
    const fans = await readFans(idol_id)
    return new SuccModel(fans)
}

async function getIdolsById(idol_id) {
    const fans = await readIdols(idol_id)
    return new SuccModel(fans)
}



/**
 * 
 * @param {*} id 
 * @returns 
 */
async function findUserById(id) {
    const user = await read({ id })
    return new SuccModel(user)
}

const modifyUserInfo = async (ctx) => {
    const { id } = ctx.session.user
    let newUserInfo = { ...ctx.request.body }
    
    const user = await update(newUserInfo, id)
    if (user) {
        return new SuccModel(user)
    } else {
        return new ErrModel({ ...UPDATE.NO_THIS_ONE })
    }
}

async function confirmFollow(fans_id, idol_id) {
    const row = await updateFollow({ fans_id, idol_id }, { confirm: true })
    if (row) return new SuccModel()
    return new ErrModel(FOLLOW.CONFIRM_ERR)
}

const logout = async (ctx) => {
    ctx.session = null
    return new SuccModel('成功登出')
}

// ----
async function getOther(other_id) {
    return new SuccModel(await readOther(other_id))
}








module.exports = {
    isEmailExist,
    register,
    findUser,
    getSelfInfo,

    getPeopleById,

    modifyUserInfo,
    getFansById,
    getIdolsById,
    followIdol,
    confirmFollow,
    cancelFollowIdol,
    findUserById,
    
    logout,

    getOther    
}