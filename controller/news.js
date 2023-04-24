/**
 * @description Controller news相關
 */
//  0426
const C_MsgReceiver = require('./msgReceiver')
//  0426
const C_ArticleReader = require('./articleReader')
//  0426
const C_IdolFans = require('./idolFans')
//  0426
const News = require('../server/news')
//  0404
const { SuccModel } = require('../model')
//  0423
async function readMore({ me, excepts, newsListNeedToConfirm }) {
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
        await confirmList(newsListNeedToConfirm)
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
    let news = await News.readList({ user_id: me.id, excepts })

    let cache = { news: [] }
    let { newsList: { unconfirm, confirm } } = news
    //  沒有更多news
    if (unconfirm.length + confirm.length === 0) {
        console.log('@ 純粹作為最後一次readMore確認')
        // cache.news.push(id)
    }
    return new SuccModel({ data: { news, me }, cache })
}
//  0423
async function confirmList(datas) {
    // let { blogs, people, comments } = list
    function getUpdateFn(type) {
        let table
        switch (type) {
            case 'people':
                table = C_IdolFans
                break
            case 'blogs':
                table = C_ArticleReader
                break
            case 'comments':
                table = C_MsgReceiver
                break
        }
        return table.confirmList
    }
    let promises = []
    for (let [type, list] of Object.entries(datas)) {
        if (list.length) {
            let fn = getUpdateFn(type)
            promises.push(fn(list))
        }
    }
    await Promise.all(promises)
    return new SuccModel()
}
//  0404
/** 藉由 userID 取得 news
 * @param {number} userId 
 * @returns {*} resModel
 */
async function getFirstNews(me) {
    /*
    news: {
        newsList: {
            unconfirm: [ { type, id, timestamp, confirm, fans|blog|comment }, ... ],
            confirm: [...]
        },
        num: { unconfirm, confirm, total },
        limit
    }*/
    let news = await News.readList({ user_id: me.id })
    let data = { me, news }
    return new SuccModel({ data })
}
module.exports = {
    //  0423
    confirmList,
    //  0423
    readMore,
    //  0404
    getFirstNews
}
