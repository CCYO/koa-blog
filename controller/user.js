/**
 * @description Controller user相關
 */
const moment = require('moment')

const {
    create, read, update,
    readFans, addFans, deleteFans,
    readIdols, readNews, updateFollow,
    readOther
} = require('../server/user')

const { validator_user_update } = require('../validator')
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

const findUser = async (email, password) => {
    const res = await read({ email, password })
    // 僅檢查帳號是否存在
    if (!password) {
        console.log('僅檢查帳號是否已被註冊')
        if (!res.id) {
            return new SuccModel('此帳號可用')
        } else {
            return new ErrModel(IS_EXIST)
        }
        // 取得帳號
    } else {
        console.log('取得帳號')
        if (res.id) return new SuccModel(res)
        return new ErrModel(READ.NOT_EXIST)
    }
}

async function findUserById(id){
    const user = await read({id})
    return new SuccModel(user)
}

const register = async (email, password) => {
    if (!password) {
        console.error(`@@@創建user時，${NO_PASSWORD.msg}`)
        return new ErrModel(NO_PASSWORD)
    }
    const { errno } = await findUser(email)
    if (errno) {
        console.error(`@@@創建user時，${IS_EXIST.msg}`)
        return new ErrModel(IS_EXIST)
    } else {
        try {
            const user = await create({
                email,
                password
            })
            console.log('@@@成功創建user ===> ', user)
            return new SuccModel(user)
        } catch (e) {
            console.error('@@@創建user時，發生預期外錯誤 ===> ', e)
            return new ErrModel({ ...UNEXPECTED, msg: e })
        }
    }
}

const modifyUserInfo = async (ctx) => {
    const { id } = ctx.session.user
    let newUserInfo = { ...ctx.request.body }
    console.log('@newUserInfo => ', newUserInfo)
    const user = await update(newUserInfo, id)
    if (user) {
        ctx.session.user = user
        return new SuccModel(user)
    } else {
        return new ErrModel({ ...UPDATE.NO_THIS_ONE })
    }
}

async function getFansById(idol_id){
    const fans = await readFans(idol_id)
    return new SuccModel(fans)
}

async function getIdolsById(idol_id){
    const fans = await readIdols(idol_id)
    return new SuccModel(fans)
}

async function confirmFollow(fans_id, idol_id){
    const row = await updateFollow({fans_id, idol_id}, {confirm: true})
    if(row) return new SuccModel()
    return new ErrModel(FOLLOW.CONFIRM_ERR)
}

const logout = async (ctx) => {
    ctx.session = null
    return new SuccModel('成功登出')
}

// ----
async function getOther(other_id){
    return new SuccModel(await readOther(other_id))
}

async function followIdol(fans_id, idol_id){
    const res = await addFans(idol_id, fans_id)
    if(res) return new SuccModel(res)
    return new ErrModel(FOLLOW.FOLLOW_ERR)
}

async function cancelFollowIdol(fans_id, idol_id){
    const res = await deleteFans(idol_id, fans_id)
    if(res) return new SuccModel()
    return new ErrModel(FOLLOW.CANCEL_ERR)   
}

async function getNews(id){
    let res = await readNews(id)
    console.log('@res => ', res)
    res.news.sort( (a, b) => {
        return a.data.showAt - b.data.showAt
    })
    res.news = res.news.map( _news => {
        _news.data.showAt = moment(_news.data.showAt,"YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
        
        console.log('@@@=>', _news.data.showAt)
        return _news
    })
    console.log('@res.news ==> ', res.news)
    return new SuccModel(res)
}


module.exports = {
    register,
    findUser,
    modifyUserInfo,
    getFansById,
    getIdolsById,
    followIdol,
    confirmFollow,
    cancelFollowIdol,
    findUserById,
    getNews,
    logout,

    getOther
}