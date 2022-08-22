/**
 * @description Controller user相關
 */

const ejs = require('ejs')

const {
    createUser,
    readUser,
    readFans,
    readIdols,
    updateUser,

    updateFollow
} = require('../server/user')

const followPeople = require('../server/followPeople')

const followBlog = require('../server/followBlog')

const {
    readBlogList
} = require('../server/blog')

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
    data.fansList = await readFans(id)
    data.idolList = await readIdols(id)
    if (!isSelf) {
        data.currentUser = await readUser({id})
    }
    return new SuccModel(data)
}

/** 追蹤
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel { Follow_People Ins { id, idol_id, fans_id }} | ErrorModel
 */
async function followIdol({fans_id, idol_id}) {
    const ok = await followPeople.addFans({idol_id, fans_id})
    if (!ok) return new ErrModel(FOLLOW.FOLLOW_ERR)
    return new SuccModel()
}

/** 取消追蹤
 * @param {number} fans_id 
 * @param {number} idol_id 
 * @returns {object} SuccessModel | ErrorModel
 */
async function cancelFollowIdol({fans_id, idol_id}) {
    const res = await followPeople.deleteFans({idol_id, fans_id})

    if(!res){
        return new ErrModel(FOLLOW.CANCEL_ERR)
    }

    //  也要將FollowBlog紀錄刪除

    //  找出 idol 為作者，且被fans追蹤的的文章
    let blogList = await readBlogList({ user_id: idol_id, follower_id: fans_id, allBlogs: true })

    if(!blogList.length){
        return new SuccModel()
    }

    let listOfBlogId = blogList.reduce((initVal, {id}) => {
        initVal.push(id)
        return initVal
    }, [])

    //  刪除關聯
    let ok = await followBlog.deleteFollower({ blog_id: listOfBlogId, follower_id: fans_id })
    if (!ok) return new ErrModel(FOLLOW.CANCEL_ERR)
    return new SuccModel()
}

//  更新user
const modifyUserInfo = async (newData, id) => {
    const user = await updateUser({newData, id})
    
    return new SuccModel(user)
}

//  登出
function logout (ctx){
    ctx.session = null
    return new SuccModel('成功登出')
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
    isEmailExist,       // api user
    register,           // api user
    findUser,           // api user
    followIdol,         // api user
    cancelFollowIdol,   // api user
    logout,             // api user

    getPeopleById,      // view user

    modifyUserInfo,     //  api user
    getFansById,        //  view user
    getIdolsById,       //  view user
}