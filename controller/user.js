/**
 * @description Controller user相關
 */

const { readBlogByAuthor } = require('../server/blog')
const { modifyCache } = require('../server/cache')

const BlogController = require('../controller/blog')
const { init_user } = require('../utils/init')          //  0228
const {
    CACHE: {
        TYPE: {
            PAGE,   //  0228
            NEWS    //  0228
        }
    }
} = require('../conf/constant')
const Blog = require('../server/blog')                  //  0228
const FollowPeople = require('../server/followPeople')  //  0228
const User = require('../server/user')                  //  0228
const { ErrModel, SuccModel } = require('../model')     //  0228
const Opts = require('../utils/seq_findOpts')           //  0228

const {
    FOLLOW,             //  0304
    PERMISSION,         //  0304
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


//  更新user
async function modifyUserInfo(newData, userId) {
    let cache = { [PAGE.USER]: [userId] }
    if (newData.nickname || newData.email || newData.avatar) {
        let res = await findRelationShipByUserId(userId)
        if (res.errno) {
            return res
        }
        let { currentUser, fansList, idolList } = res.data
        let people = [...fansList, ...idolList]

        let { data: blogs } = await BlogController.getBlogListByUserId(userId, false)
        let blogList = blogs.map((blog) => blog.id)
        
        cache[NEWS] = people
        cache[PAGE.USER] = [...cache[PAGE.USER], ...people]
        cache[PAGE.BLOG] = blogList
    }
    let user = await User.updateUser({ newData, id: userId })
    return new SuccModel({data: user, cache})
}

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
async function findRelationShipByUserId(user_id) {
    let resModel = await findUser(user_id)
    let { errno, data: currentUser } = resModel
    //  結果不如預期
    if (errno) {
        return resModel
    }
    let { data: fansList } = await findFans(user_id)
    let { data: idolList } = await findIdols(user_id)
    let data = { currentUser, fansList, idolList }
    return new SuccModel({ data })
}
//  0304
async function findIdols(fans_id) {
    // user: { id, FollowPeople_I: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.findIdolsByFansId(fans_id))
    let idols = user ? init_user(user.FollowPeople_I) : []
    return new SuccModel({ data: idols })
}
//  0304
async function findFans(idol_id) {
    // user: { id, FollowPeople_F: [{ id, email, nickname, avatar }, ...] }
    let user = await User.readUser(Opts.findFansByIdolId(idol_id))
    let fans = user ? init_user(user.FollowPeople_F) : []
    return new SuccModel({ data: fans })
}
//  0304
async function findUser(id) {
    const user = await User.readUser(Opts.findUser(id))
    if (!user) {
        return new ErrModel(READ.NOT_EXIST)
    }
    return new SuccModel({ data: user })
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

    const checkModel = await isEmailExist(email)

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
async function login(email, password) {
    if (!email || !password) {
        return new ErrModel(LOGIN.DATA_IS_INCOMPLETE)
    }
    const user = await User.readUser(Opts.findUser({ email, password }))
    if (!user) {
        return new ErrModel(LOGIN.NO_USER)
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

module.exports = {
    modifyUserInfo,     //  api user

    cancelFollowIdol,       //  0303
    followIdol,             //  0303
    findRelationShipByUserId,    //  0228
    findUser,               //  0303
    register,               //  0228
    login,                  //  0228
    isEmailExist,           //  0228
}