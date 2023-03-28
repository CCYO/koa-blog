/**
 * @description Controller news相關
 */

const { htmlStr_newsList } = require('../utils/ejs-render')
const Init = require('../utils/init')
const {
    readNews,
    updateNews,
} = require('../server/news')
const { ErrModel, SuccModel } = require('../model')
const { NEWS } = require('../model/errRes')

/** 藉由 userID 取得 news
 * @param {number} userId 
 * @returns {*} resModel
 */
async function getMeAndTheFirstNews(me) {
    /*
    news: {
        newsList: {
            unconfirm: [ { type, id, timestamp, confirm, fans|blog|comment }, ... ],
            confirm: [...]
        },
        num: { unconfirm, confirm, total },
        limit
    }*/
    let news = await readNews({ userId: me.id })
    let data = { me, news }
    return new SuccModel({data})
}

async function readMore({me, excepts, newsListNeedToConfirm}) {
    /*
    excepts: {
        people: [ id, ... ],
        blogs: [ id, ... ],
        comments: [ id, ...],
        num: NUMBER
    },
    newsListNeedToConfirm: { peopel, blogs, comments, num }
    */

    if (newsListNeedToConfirm.num) {
        let res = await confirmNews(newsListNeedToConfirm)
        if (res.errno) {
            throw res
        }
    }
    /*
    res: {
        newsList: {
            unconfirm: [
                { type, id, timestamp, confirm, fans: ... },
                { type, id, timestamp, confirm, blog: ... },
                { type, id, timestamp, confirm, comment: ... },
            ... ],
            confirm: [...]
        },
        num: { unconfirm, confirm, total },
        limit
    }*/
    let news = await readNews({ userId: me.id, excepts })
    console.log('@ news => ', news)
    let cache = { news: [] }
    let { newsList: { unconfirm, confirm} } = news
    if(unconfirm.length + confirm.length === 0){
        console.log('@ 純粹作為最後一次readMore確認')
        // cache.news.push(id)
    }

    return new SuccModel({ news, me }, cache)
}

async function confirmNews(listOfNewsId) {
    let { blogs, people, comments } = listOfNewsId
    const { rowOfBlogs, rowOfPeople, rowOfComments } = await updateNews(listOfNewsId)
    if (blogs.length !== rowOfBlogs) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== rowOfPeople) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    } else if (comments.length !== rowOfComments) {
        return new ErrModel(NEWS.FOLLOW_COMMENT_CONFIRM_ERR)
    }
    let res = { listOfNewsId, count: rowOfBlogs + rowOfPeople }
    return new SuccModel(res)
}


async function readMoreByUserId(userId, markTime, listOfexceptNewsId, fromFront = false, offset) {

    let { newsList, numOfUnconfirm, total } = await readNews({ userId, markTime, listOfexceptNewsId, fromFront })

    let count = newsList.confirm.length + newsList.unconfirm.length
    let htmlStr = await htmlStr_newsList(newsList)

    let { confirm, unconfirm } = Init.init_newsOfFollowId(newsList)

    let res = {
        numOfUnconfirm,
        total,
        count,
        htmlStr,
        listOfNewsId: confirm
    }

    if (!newsList.unconfirm.length) {
        return new SuccModel(res)
    }

    //  若有 unconfirm 則直接作 confirm
    let resModel = await confirmNews(unconfirm)
    if (resModel.errno) {
        return resModel
    }

    res.listOfNewsId = {
        people: [...confirm.people, ...unconfirm.people],
        blogs: [...confirm.blogs, ...unconfirm.blogs],
        comments: [...confirm.comments, ...unconfirm.comments]
    }

    return new SuccModel(res)
}

module.exports = {
    getMeAndTheFirstNews,    //  view user
    readMoreByUserId,   //  api news
    confirmNews,         //  api news
    readMore
}