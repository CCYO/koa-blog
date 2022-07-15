/**
 * @description Controller news相關
 */

const { resolve } = require('path')

const moment = require('moment')

const myRenderFile = require('../utils/renderFile')
const { init_4_newsList } = require('../utils/init/news')

const { NEWS: { LIMIT } } = require('../conf/constant')
const {
    readNews,


    updateNews,
    updateBlogFansComfirm,
    updateFollowComfirm
} = require('../server/news')



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
    FOLLOW,
    NEWS
} = require('../model/errRes')

async function getNewsByUserId(userId) {
    let data = await readNews({ userId })
    let res = await init_4_newsList(data)
    return new SuccModel(res)
    
}

async function readMoreByUserId(userId, markTime, page) {
    let data = await readNews({ userId, markTime, page })
    
    let res = await init_4_newsList(data)
    
    let ejs_newsForEach = resolve(__dirname, '../views/wedgets/navbar/news-forEach.ejs')
    // res = { confirm: [], unconfirm: [], count: newsList.length, total, markTime, page }

    let more = res.total > (res.page + 1) * LIMIT

    let htmlStr = { confirm: undefined, unconfirm: undefined }

    htmlStr.confirm = res.confirm.length && await myRenderFile(ejs_newsForEach, { list: res.confirm }) || undefined
    htmlStr.unconfirm = res.unconfirm.length && await myRenderFile(ejs_newsForEach, { list: res.unconfirm }) || undefined

    res = { ...res, ...htmlStr }
    
    return new SuccModel(res)
}



async function confirmNews(payload) {
    let { blogs, fans } = payload
    const { blogRow, fansRow } = await updateNews(payload)
    console.log('@blogs => ', blogs.length)
    console.log('@blogsRow => ', blogRow)
    console.log('@fans => ', fans.length)
    console.log('@fansRow => ', fansRow)
    if (blogs.length !== blogRow) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (fans.length !== fansRow) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    return new SuccModel()
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,

    confirmNews
}