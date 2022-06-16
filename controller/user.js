/**
 * @description Controller user相關
 */
const moment = require('moment')
const ejs = require('ejs')
const { resolve } = require('path')

const {
    createUser,
    readUser,

    readBlogListAndAuthorByUserId,
    readUserAndFollowReationByUserId,

    update,
    readFans, addFans, deleteFans,
    readIdols, readNews, updateFollow,
    readOther,
    confirmNews,
    UnconfirmNewsCount,
    readMoreNewsAndConfirm
} = require('../server/user')

const {
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
    console.log('@newUserInfo => ', newUserInfo)
    const user = await update(newUserInfo, id)
    if (user) {
        ctx.session.user = user
        return new SuccModel(user)
    } else {
        return new ErrModel({ ...UPDATE.NO_THIS_ONE })
    }
}

async function getFansById(idol_id) {
    const fans = await readFans(idol_id)
    return new SuccModel(fans)
}

async function getIdolsById(idol_id) {
    const fans = await readIdols(idol_id)
    return new SuccModel(fans)
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

async function followIdol(fans_id, idol_id) {
    const res = await addFans(idol_id, fans_id)
    if (res) return new SuccModel(res)
    return new ErrModel(FOLLOW.FOLLOW_ERR)
}

async function cancelFollowIdol(fans_id, idol_id) {
    const res = await deleteFans(idol_id, fans_id)
    if (res) return new SuccModel('已取消追蹤')
    return new ErrModel(FOLLOW.CANCEL_ERR)
}

// get NewsList for VIEW of user navbar 
async function getNews(user_id) {

    let { news, more, count } = await readNews(user_id)

    let checkTime = { type: undefined, id: undefined, time: undefined }

    for (prop in news) {

        if (news[prop].length) {

            //  調整順序
            news[prop].sort((a, b) => {
                return b.showAt - a.showAt
            })

            //  找出最新的一條news
            if (prop === 'unconfirm') {
                let { news_id, blog_id, fans_id, showAt } = news[prop][0]
                checkTime.type = (blog_id) ? 'blog' : 'fans'
                checkTime.id = news_id
                checkTime.time = showAt.getTime()
            }

            //  調整news items 的時間格式
            news[prop] = news[prop].map(item => {
                item.showAt = moment(item.showAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
                return item
            })
        }
    }

    let data = {
        news,
        more,
        count,
        checkTime,
        index: (more) ? 1 : 0
    }

    return new SuccModel(data)
}

async function readMore(user_id, index, checkTime, window_news_count = 0) {
    const { news, more, new_news } = await readMoreNewsAndConfirm(user_id, index, checkTime, window_news_count)
    let ejs_newsForEach = resolve(__dirname, '../views/wedgets/navbar/news-forEach.ejs')

    let data = {
        more, index,
        htmlStr: { unconfirm: undefined, confirm: undefined },
        news: { count: new_news.count, htmlStr: undefined, checkTime: {} }
    }

    if (more) {
        data.index = index + 1
    }

    for (prop in news) {
        if (news[prop].length) {
            //  調整順序
            news[prop].sort((a, b) => {
                return b.showAt - a.showAt
            })

            //  調整news items 的時間格式
            news[prop] = news[prop].map(item => {
                item.showAt = moment(item.showAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
                return item
            })

            //  取得news的htmlStr
            data.htmlStr[prop] = await _renderFile(ejs_newsForEach, { list: news[prop], firstRender: false })
        }
    }

    /* 整理 new_news */
    //  new_news = { news: arr, count }

    if (new_news.news.length) {

        //  調整順序
        new_news.news.sort((a, b) => {
            return b.showAt - a.showAt
        })

        //  找出最新的一條news

        let target = new_news.news[new_news.news.length - 1]
        data.news.checkTime = {
            time: target.showAt.getTime(),
            type: (target.blog_id) ? 'blog' : 'fans',
            id: target.new_id
        }

        //  調整news items 的時間格式
        new_news.news = new_news.news.map(item => {
            item.showAt = moment(item.showAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
            return item
        })

        data.news.htmlStr = await _renderFile(ejs_newsForEach, { list: new_news.news, firstRender: true })
    }

    function _renderFile(fileName, data) {
        return new Promise((resolve, reject) => {
            ejs.renderFile(fileName, data, function (e, str) {
                if (e) {
                    console.log('@e => ', e)
                    return reject(e)
                }
                resolve(str)
            })
        })
    }

    return new SuccModel(data)
}


//  取得 Idol fans 以及自己公開/隱藏的blog
async function getSelfInfo(id) {
    let { author, blogList } = await readBlogListAndAuthorByUserId(id)
    let { user, fans, idols } = await readUserAndFollowReationByUserId(id)

    //  處理 current user 的 blogs
    let blogs = { show: [], hidden: [] }

    //  彙整 公開與隱藏的blog
    blogList.length && blogList.forEach((blog) => {
        blog.show && blogs.show.push(blog)
        !blog.show && blogs.hidden.push(blog)
    })

    return new SuccModel({ author, blogs, fans, idols })
}

//  取得 Idol fans 以及該使用者公開的blog
async function getOtherInfo(id) {
    let { author, blogList } = await readBlogListAndAuthorByUserId(id)
    let { fans, idols } = await readUserAndFollowReationByUserId(id)

    //  處理 current user 的 blogs
    let blogs = { show: [] }

    //  彙整 公開的blog
    blogList.length && blogList.forEach((blog) => {
        blog.show && blogs.show.push(blog)
    })

    return new SuccModel({ author, blogs, fans, idols })
}

async function confirmUserNews(user_id, time) {
    const res = await confirmNews(user_id, time)
    return new SuccModel()
}

module.exports = {
    isEmailExist,
    findUser,
    register,

    modifyUserInfo,
    getFansById,
    getIdolsById,
    followIdol,
    confirmFollow,
    cancelFollowIdol,
    findUserById,
    confirmUserNews,

    getNews,
    getSelfInfo,
    getOtherInfo,
    logout,

    getOther,
    confirmUserNews,
    readMore,
}