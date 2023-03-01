/**
 * @description Controller user相關
 */

const ejs = require('ejs')

const {
    CACHE: {
        TYPE: {
            PAGE,   //  0228
            NEWS    //  0228
        }
    }
} = require('../conf/constant')
const Blog = require('../server/blog')
const FollowPeople = require('../server/followPeople')  //  0228
let User = require('../server/user')    //  0228

const {
    ErrModel,   //  0228
    SuccModel   //  0228
} = require('../model')

const Opts = require('../utils/seq_findOpts')   //  0228

const {
    UPDATE,
    FOLLOW,

    FOLLOWBLOG,     //  0228
    READ,           //  0228
    REGISTER: {
        NO_PASSWORD,    //  0228
        NO_EMAIL,    //  0228
        IS_EXIST,   //  0228
    },
} = require('../model/errRes')

const { getBlogListByUserId } = require('../controller/blog')

const {
    readUser,
    readFans,
    readIdols,
    updateUser
} = require('../server/user')

const FollowBlog = require('../server/followBlog')  //  0228
const Cache = require('../server/cache')
const {
    readBlogByAuthor
} = require('../server/blog')

const {
    modifyCache,

    tellPeopleFollower
} = require('../server/cache')

const { isNoCache } = require('../utils/env')

/** 取消追蹤    0228
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
async function cancelFollowIdol({ fans_id, idol_id }) {
    let ok = await FollowPeople.deleteFans({ idol_id, fans_id })
    if (!ok) {
        return new ErrModel(FOLLOW.CANCEL_ERR)
    }

    let blogs = await Blog.readBlogs(Opts.findBlogsByFollowerShip({ idol_id, fans_id }))
    let blogList = blogs.map(({ id }) => id)    
    if (blogList.length) {
        //  刪除關聯
        let ok = await FollowBlog.deleteFollower({ blogList, follower_id: fans_id })
        if (!ok) {
            return new ErrModel(FOLLOWBLOG.DEL_ERR)
        }
    }
    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [fans_id, idol_id] }
    return new SuccModel({ cache })
}

/** 追蹤    0228
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function followIdol({ fans_id, idol_id }) {
    const ok = await FollowPeople.createFans({ idol_id, fans_id })
    if (!ok) return new ErrModel(FOLLOW.FOLLOW_ERR)
    //  處理緩存
    let cache = { [PAGE.USER]: [fans_id, idol_id], [NEWS]: [idol_id] }
    return new SuccModel({ cache })
}

/** 藉由 userID 找到 當前頁面使用者的資訊，以及(被)追蹤的關係   0228
 * @param {number} user_id 
 * @returns {{ currentUser: { id, email, nickname, avatar, age }, fansList: [{ id, avatar, email, nickname }], idolList: [{ id, avatar, email, nickname }]}}
 */
async function getRelationShipByUserId(id) {
    let data = {}
    data.currentUser = await User.readUser(Opts.findUser(id))
    data.fansList = await User.readFans(Opts.findFans(id))
    data.idolList = await User.readIdols(Opts.findIdols(id))
    return new SuccModel({ data })
}

/** 註冊 0228
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
const register = async (email, password) => {
    if (!password) {
        return new ErrModel(NO_PASSWORD)
    } else if (!email) {
        return new ErrModel(NO_EMAIL)
    }

    const checkModel = await User.isEmailExist(email)

    if (checkModel.errno) {
        return new ErrModel(checkModel)
    }

    const user = await User.createUser({ email, password })
    return new SuccModel({ data: user })
}

/** 登入 user   0228
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
const login = async (email, password) => {
    const user = await User.readUser(Opts.login({ email, password }))
    if (!user) {
        return new ErrModel(READ.NOT_EXIST)
    }
    return new SuccModel({ data: user })
}

/** 確認信箱是否已被註冊 0228
 * @param {string} email 信箱 
 * @returns {object} resModel
 */
async function isEmailExist(email) {
    const exist = await User.readUser(Opts.findUserByEmail(email))

    if (!exist) {
        return new SuccModel()
    } else {
        return new ErrModel(IS_EXIST)
    }
}


async function getUserViewData(user_id) {

    let { exist, kv } = await Cache.get_user(user_id)

    let data = {}
    if (exist !== HAS_CACHE) {
        let currentUser = await User.readUser({ id: user_id })
        let fansList = await User.readFans(Opts.findFans(user_id))
        let idolList = await User.readIdols(Opts.findIdols(user_id))
        let { data: blogList } = await getBlogListByUserId(user_id)
        data = { currentUser, fansList, idolList, blogList }
        if (!isNoCache) {
            await Cache.set_user(user_id, data)
        }
    } else {
        data = kv[1]
    }

    return new SuccModel(data)
}



/** 查找 user
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
const findUser = async ({ id, email, password }) => {
    const res = await readUser({ id, email, password })
    if (!res) {
        return new ErrModel(READ.NOT_EXIST)
    }
    return new SuccModel(res)
}




//  更新user
const modifyUserInfo = async (newData, id) => {
    let user = await updateUser({ newData, id })
    let cache = { [USER]: id }
    if (newData.nickname || newData.email || newData.avatar) {
        let fans = await followPeople.readFans({ idol_id: id })
        let idols = await followPeople.readIdols({ fans_id: id })
        let people = [...fans, ...idols]
        let blog = await readBlogByAuthor(id)
        cache[NEWS] = people
        cache[USER] = [...cache[USER], ...people]
        cache[BLOG] = blog
    }
    await modifyCache(cache)
    return new SuccModel(user)
}




//  找出粉絲列表
async function getFansById(idol_id) {
    const fans = await readFans(idol_id)
    return new SuccModel(fans)
}

//  找出偶像列表
async function getIdolsById(idol_id) {
    const fans = await readIdols(idol_id)
    return new SuccModel(fans)
}

module.exports = {
    findUser,
    followIdol,         // api user
    cancelFollowIdol,   // api user
    modifyUserInfo,     //  api user
    getFansById,
    getIdolsById,
    getUserViewData,

    getRelationShipByUserId,    //  0228
    register,               //  0228
    login,                  //  0228
    isEmailExist,           //  0228
}