/**
 * @description Controller user相關
 */
const C_Blog = require('./blog')    //  0309
const { ErrRes, ErrModel, SuccModel, MyErr } = require('../model')  //  0404
const Opts = require('../utils/seq_findOpts')                       //  0404
const User = require('../server/user')                              //  0404

//  0404
async function findInfoForUserPage(userId) {
    //  向 DB 撈取數據  
    let resModel = await findRelationShip(userId)
    let { data: { currentUser, fansList, idols } } = resModel
    //  向 DB 撈取數據
    let { data: blogs } = await C_Blog.findListForUserPage(userId)
    let data = { currentUser, fansList, idols, blogs }
    return new SuccModel({ data })
}
//  0404
async function findRelationShip(userId) {
    let userModel = await find(userId)
    if (userModel.errno) {
        throw new MyErr({ ...userModel })
    }
    let { data: currentUser } = userModel
    let { data: idols } = await _findIdols(userId)
    let { data: fansList } = await findFansList(userId)
    let data = { currentUser, idols, fansList }
    return new SuccModel({ data })
}
//  0404
async function _findIdols(fans_id) {
    let data = await User.readList(Opts.USER.findIdols(fans_id))
    return new SuccModel({ data })
}
//  0404
async function findFansList(idol_id) {
    let data = await User.readList(Opts.USER.findFansList(idol_id))
    return new SuccModel({ data })
}
//  0404
async function find(id) {
    const data = await User.read(Opts.USER.find(id))
    if (!data) {
        return new ErrModel(ErrRes.USER.READ.NO_DATA)
    }
    return new SuccModel({ data })
}
//  0404
/** 登入 user
 * @param {string} email user 的信箱
 * @param {string} password user 的未加密密碼
 * @returns resModel
 */
async function login(email, password) {
    if (!email || !password) {
        return new ErrModel(ErrRes.USER.LOGIN.DATA_INCOMPLETE)
    }
    const data = await User.read(Opts.USER.login({ email, password }))
    if (!data) {
        return new ErrModel(ErrRes.USER.LOGIN.NO_USER)
    }
    return new SuccModel({ data })
}
//  0404
/** 註冊
 * @param {string} email - user 的信箱
 * @param {string} password - user 未加密的密碼
 * @returns {object} SuccessMode || ErrModel Instance
 */
async function register(email, password) {
    if (!password) {
        return new ErrModel(ErrRes.USER.REGISTER.NO_PASSWORD)
    } else if (!email) {
        return new ErrModel(ErrRes.USER.REGISTER.NO_EMAIL)
    }
    const resModel = await isEmailExist(email)
    if (resModel.errno) {
        return resModel
    }
    const data = await User.create(Opts.USER.create({ email, password }))
    return new SuccModel({ data })
}
//0404
/** 確認信箱是否已被註冊
 * @param {string} email 信箱 
 * @returns {object} resModel
 */
async function isEmailExist(email) {
    const exist = await User.read(Opts.USER.isEmailExist(email))
    if (exist) {
        return new ErrModel(ErrRes.USER.REGISTER.IS_EXIST)
    }
    return new SuccModel()
}

module.exports = {
    //  0404
    findInfoForUserPage,
    //  0404
    findRelationShip,
    //  0404
    findFansList,
    //  0404
    find,
    //  0404
    login,
    //  0404
    register,
    //  0404
    isEmailExist,
    

    findOthersInSomeBlogAndPid, //  0328
    modifyUserInfo,             //  0309
}




const CommentController = require('./comment')


const {
    CACHE: {
        TYPE: {
            API,
            PAGE,   //  0228
            NEWS    //  0228
        }
    }
} = require('../conf/constant')



async function findOthersInSomeBlogAndPid({ commenter_id, p_id, blog_id, createdAt }) {
    //  [ { id, nickname, email, comments: [id, ...] }, ... ]
    let commenters = await User.readUsers(Opts.USER.findOthersInSomeBlogAndPid({ commenter_id, p_id, blog_id, createdAt }))
    return new SuccModel({ data: commenters })
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


