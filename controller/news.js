/**
 * @description Controller news相關
 */

const { resolve } = require('path')

const moment = require('moment')

const myRenderFile = require('../utils/renderFile')

const { NEWS: { LIMIT } } = require('../conf/constant')
const {
    readNews,


    updateNews,
    updateBlogFansComfirm,
    updateFollowComfirm
} = require('../server/news')

const {
    readUser
} = require('../server/user')

const {
    readBlogById
} = require('../server/blog')

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

async function _init_newsList(data) {
    let { newsList, total, markTime, page } = data
    let res = { confirm: [], unconfirm: [], count: newsList.length, total, markTime, page }

    if (!res.count) {
        return res
    }

    let promiseList = await Promise.all(
        newsList.map(
            async (news) => {
                let { type, id, target_id, follow_id, confirm, time } = news
                time = moment(time, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
                if (type === 1) {
                    let { id: fans_id, nickname } = await readUser({ id: follow_id })
                    return { type, id, fans_id, nickname, confirm, time }
                } else if (type === 2) {
                    let { id: blog_id, title, author: { id: author_id, nickname } } = await readBlogById(target_id)
                    return ({ type, id, blog_id, title, author_id, nickname, confirm, time })
                }
            }
        )
    )

    let newsConfirmList = promiseList.reduce((init, item, index) => {
        let { confirm } = item
        confirm && init.confirm.push(item)
        !confirm && init.unconfirm.push(item)
        return init
    }, { unconfirm: [], confirm: [] })

    return { ...res, ...newsConfirmList }
}

async function getNewsByUserId(userId) {
    let data = await readNews({ userId })
    let res = await _init_newsList(data)
    return new SuccModel(res)
    
}

async function readMoreByUserId(userId, markTime, page) {
    let data = await readNews({ userId, markTime, page })
    console.log('@data => ', data)
    let res = await _init_newsList(data)
    
    let ejs_newsForEach = resolve(__dirname, '../views/wedgets/navbar/news-forEach.ejs')
    // res = { confirm: [], unconfirm: [], count: newsList.length, total, markTime, page }

    let more = res.total > (res.page * LIMIT)

    let htmlStr = { confirm: undefined, unconfirm: undefined, more }

    htmlStr.confirm = res.confirm.length && await myRenderFile(ejs_newsForEach, { list: res.confirm }) || undefined
    htmlStr.unconfirm = res.unconfirm.length && await myRenderFile(ejs_newsForEach, { list: res.unconfirm }) || undefined

    return new SuccModel(htmlStr)
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