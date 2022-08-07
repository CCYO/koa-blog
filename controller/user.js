/**
 * @description Controller user相關
 */

const ejs = require('ejs')

const {
    createUser,
    readUser,
    readFansByUserId,
    readIdolsByUserId,

    update,
    addFans, deleteFans,
    updateFollow,
    readOther
} = require('../server/user')

const {
    readBlogList
} = require('../server/blog')

const {
    FollowBlog,
} = require('../server/news')

const { ErrModel, SuccModel } = require('../model')

const {
    REGISTER: {
        IS_EXIST,
        NO_PASSWORD
    },
    READ,
    UPDATE,
    FOLLOW
} = require('../model/errRes')

/** 確認信箱是否已被註冊
 * @param {string} email 信箱 
 * @returns {object} resModel
 */
async function isEmailExist(email) {
    const res = await readUser({ email })

    if (!res) {
        return new SuccModel('此帳號仍未被使用，歡迎註冊')
    } else {
        return new ErrModel(IS_EXIST)
    }
}

/** 註冊
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
const register = async (email, password) => {
    if (!password) {
        return new ErrModel(NO_PASSWORD)
    }

    const { errno } = await isEmailExist(email)

    if (errno) {
        return new ErrModel(IS_EXIST)
    }

    const user = await createUser({ email, password })
    return new SuccModel(user)
}

/** 查找 user
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
const findUser = async ({ id, email, password }) => {
    const res = await readUser({ id, email, password })
    if (!res){
        return new ErrModel(READ.NOT_EXIST)
    } 
    return new SuccModel(res)
}

/** 藉由 userID 找到 當前頁面使用者的資訊，以及(被)追蹤的關係
 * @param {number} user_id 
 * @returns {{ currentUser: { id, email, nickname, avatar, age }, fansList: [{ id, avatar, email, nickname }], idolList: [{ id, avatar, email, nickname }]}}
 */
async function getPeopleById(id, isSelf = false) {
    let data = {}
    data.fansList = await readFansByUserId(id)
    data.idolList = await readIdolsByUserId(id)
    if (!isSelf) {
        data.currentUser = await readUser({ id })
    }
    return new SuccModel(data)
}

//  取得 Idol fans 以及自己公開/隱藏的blog
async function getSelfInfo(id) {
    let blogList = await readBlogsByUserId(id)
    let fansList = await readFansByUserId(id)
    let idolsList = await readIdolsByUserId(id)

    let blogs = { show: [], hidden: [] }
    //  處理 blogs
    if (blogList.length) {
        blogList.forEach(item => {
            let { blog: { show } } = item
            show && blogs.show.push(item) || blogs.hidden.push(item)
        })
    }

    return new SuccModel({ blogList: blogs, fansList, idolsList })
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
    let blogList = await readBlogList({ user_id: idol_id, getAll: true })
    let blogList_id = []
    if (blogList.length) {
        blogList.forEach(({ id }) => blogList_id.push(id))
    }
    //  刪除關聯
    await FollowBlog.deleteBlog({ blogList_id, follower_id: fans_id })
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

    logout,

    getOther
}