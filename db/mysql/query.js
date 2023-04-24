const { MyErr } = require('../../model')
const C_Comment = require('../../controller/comment')
const C_Blog = require('../../controller/blog')
const C_User = require('../../controller/user')
const moment = require('moment')
const { QueryTypes } = require('sequelize')
const { seq } = require('./model')
const { NEWS } = require('../../conf/constant')

//  0404
async function count({ user_id }) {
    let query = `
    SELECT
        COUNT(if(confirm < 1, true, null)) as unconfirm, 
        COUNT(if(confirm = 1, true, null)) as confirm, 
        COUNT(*) as total
    FROM (
        SELECT ${NEWS.TYPE.IDOL_FANS} as type, id, confirm
        FROM IdolFans
        WHERE
            idol_id=${user_id} 
        UNION

        SELECT ${NEWS.TYPE.ARTICLE_READER} as type, id, confirm
        FROM ArticleReaders
        WHERE 
            reader_id=${user_id}
            AND deletedAt IS NULL 
        UNION

        SELECT ${NEWS.TYPE.MSG_RECEIVER} as type, id, confirm
        FROM MsgReceivers
        WHERE
            receiver_id=${user_id}
            AND deletedAt IS NULL 
    ) AS X
    `
    let [{ unconfirm, confirm, total }] = await seq.query(query, { type: QueryTypes.SELECT })

    return { num: { unconfirm, confirm, total } }
}
//  0404
async function readNews({ user_id, excepts }) {
    // let { people, blogs, comments } = excepts
    let list = { people: '', blogs: '', comments: '' }
    if (excepts) {
        for (key in list) {
            list[key] = excepts[key].length && ` AND id NOT IN (${excepts[key].join(',')})` || ''
        }
    }

    let query = `
    SELECT type, id, target_id, follow_id, confirm, createdAt
    FROM (
        SELECT ${NEWS.TYPE.IDOL_FANS} as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt
        FROM IdolFans
        WHERE 
            idol_id=${user_id}
            ${list.people}

        UNION

        SELECT ${NEWS.TYPE.ARTICLE_READER} as type, id, article_id as target_id, reader_id as follow_id, confirm, createdAt 
        FROM ArticleReaders
        WHERE 
            reader_id=${user_id}
            AND deletedAt IS NULL
            ${list.blogs}

        UNION

        SELECT ${NEWS.TYPE.MSG_RECEIVER} as type, id, msg_id as target_id, receiver_id as follow_id, confirm, createdAt 
        FROM MsgReceivers
        WHERE 
            receiver_id=${user_id}
            AND deletedAt IS NULL
            ${list.comments}

    ) AS X
    ORDER BY confirm=1, createdAt DESC
    LIMIT ${NEWS.LIMIT}
    `
    let newsList = await seq.query(query, { type: QueryTypes.SELECT })
    return await initNews(newsList)
}
//  0404
async function initNews(newsList) {
    let list = await Promise.all(newsList.map(findNews))
    //  分為 讀過/未讀過
    let res = list.reduce((acc, news) => {
        if (news.confirm) {
            acc.confirm.push(news)
        } else {
            acc.unconfirm.push(news)
        }
        return acc
    }, { unconfirm: [], confirm: [] })
    res.list = newsList.reduce((acc, item) => {
        let { type, id, target_id, follow_id, confirm, createdAt } = item
        if(!confirm){
            if(type === 1){
                acc.people.push( { id, idol_id: target_id, fans_id: follow_id })
            }else if(type === 2){
                acc.blogs.push( { type, id, article_id: target_id, reader_id: follow_id })
            }else{
                acc.comments.push( { type, id, msg_id: target_id, receiver_id: follow_id })
            }
            acc.num += 1
        }
        return acc
    }, { people: [], blogs: [], comments: [], num: 0})
    return res
    //  0404
    async function findNews(news) {
        let { type, id, target_id, follow_id, confirm, createdAt } = news
        //  序列化時間數據
        let timestamp = moment(createdAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
        //  結果的預設值
        let res = { type, id, timestamp, confirm }
        if (type === NEWS.TYPE.IDOL_FANS) {
            let resModel = await C_User.find(follow_id)
            if (resModel.errno) {
                throw new MyErr(resModel) 
            }
            return { ...res, fans: resModel.data }
        } else if (type === NEWS.TYPE.ARTICLE_READER) {
            let resModel = await C_Blog.find(target_id)
            if (resModel.errno) {
                throw new MyErr(resModel)
            }
            return { ...res, blog: resModel.data }
        } else if (type === NEWS.TYPE.MSG_RECEIVER) {
            let { data: comment } = await C_Comment.findInfoForNews(target_id)
            return { ...res, comment }
        }
    }
}

module.exports = {
    //  0404
    count,
    //  0404
    readNews,
    countNewsTotalAndUnconfirm
}

async function countNewsTotalAndUnconfirm({ user_id, options }) {
    let { markTime, fromFront } = options

    let select =
        !fromFront ?
            `SELECT COUNT(if(confirm < 1, true, null))` :
            `SELECT COUNT(if(DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T'), true, null)) `

    let query = `
    ${select} as numOfUnconfirm, COUNT(*) as total
    FROM (
        SELECT 1 as type, id, confirm, createdAt
        FROM FollowPeople
        WHERE
            idol_id=${user_id} 

        UNION

        SELECT 2 as type, id, confirm, createdAt
        FROM FollowBlogs
        WHERE 
            follower_id=${user_id}
            AND deletedAt IS NULL 

        UNION

        SELECT 3 as type, id, confirm, updatedAt
        FROM FollowComments
        WHERE
            follower_id=${user_id}
    ) AS X
    `
    let [{ numOfUnconfirm, total }] = await seq.query(query, { type: QueryTypes.SELECT })

    return { numOfUnconfirm, total }
}


