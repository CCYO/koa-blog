//  0430
const { SuccModel, ErrRes, MyErr } = require('../model')
//  0430
const { NEWS: { TYPE: { IDOL_FANS, ARTICLE_READER, MSG_RECEIVER }} } = require('../conf/constant')
/**
 * @description Controller news相關
 */
//  0426
const News = require('../server/news')

//  0430
async function confirm({ type, id }) {
    let row = await News.update(type, id, { confirm: true })
    if(row !== 1){
        let TABLE = getTableName(type)
        throw new MyErr(ErrRes[TABLE].UPDATE.CONFIRM)
    }
    return new SuccModel()
    function getTableName(type) {
        switch (type) {
            case IDOL_FANS:
                return 'IDOL_FANS'
            case ARTICLE_READER:
                return 'ARTICLE_READER'
            case MSG_RECEIVER:
                return 'MSG_RECEIVER'
        }
    }
}
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
    // if (newsListNeedToConfirm.num) {
    //     await confirmList(newsListNeedToConfirm)
    // }
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

    // let cache = { news: [] }
    let { newsList: { unconfirm, confirm } } = news
    //  沒有更多news
    if (unconfirm.length + confirm.length === 0) {
        console.log('@ 純粹作為最後一次readMore確認')
        // cache.news.push(id)
    }
    return new SuccModel({ data: { news, me }})
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
    confirm,
    //  0423
    readMore,
    //  0404
    getFirstNews
}
