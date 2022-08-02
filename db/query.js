const { QueryTypes } = require('sequelize')
const moment = require('moment')

const {
    NEWS: {
        LIMIT
    }
} = require('../conf/constant')

const { seq } = require('./model')

const { readUser } = require('../server/user')
const { readBlogById } = require('../server/blog')
const { readComment } = require('../server/comment')

async function readNews({ userId, offset = 0, whereOps, fromFront}) {
    let { markTime, listOfexceptNewsId: {people, blogs, comments} } = whereOps
    let listOfPeopleId = people.join(',') || undefined
    let listOfBlogsId = blogs.join(',') || undefined
    let listOfCommentsId = comments.join(',')
    
    let where_time = `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`

    let query = `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt as time
        FROM FollowPeople
        WHERE idol_id=${userId}
            AND ${where_time}
            ${listOfPeopleId && ` AND id NOT IN (${listOfPeopleId})` || ''}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt as time
        FROM FollowBlogs
        WHERE follower_id=${userId}
            AND deletedAt IS NULL
            AND ${where_time}
            ${listOfBlogsId && ` AND id NOT IN (${listOfBlogsId})` || ''}

        UNION

        SELECT 3 as type, id, comment_id as target_id, follower_id as follow_id, confirm, updatedAt as time
        FROM FollowComment
        WHERE follower_id=${userId}
            AND ${where_time}
            ${listOfCommentsId && ` AND id NOT IN (${listOfCommentsId})` || ''}

    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${LIMIT} OFFSET ${offset}
    `
    let newsList = await seq.query(query, { type: QueryTypes.SELECT })
    console.log('@query查詢結果 => ', newsList)
    return await _init_newsOfComfirmRoNot(newsList, fromFront)
}

async function countNewsTotalAndUnconfirm({ userId, markTime, fromFront}) {
    
    // let mark = fromFront ? '<' : '>'
    // let where_time = fromFront ? `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T')` : 1
    let select = 
        !fromFront ?
        `SELECT COUNT(if(confirm < 1, true, null))`  :
        `SELECT COUNT(if(DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T'), true, null)) `

    let query = `
    ${select} as numOfUnconfirm, COUNT(*) as total
    FROM (
        SELECT 1 as type, id, confirm, createdAt
        FROM FollowPeople
        WHERE
            idol_id=${userId} 

        UNION

        SELECT 2 as type, id, confirm, createdAt
        FROM FollowBlogs
        WHERE 
            follower_id=${userId}
            AND deletedAt IS NULL 

        UNION

        SELECT 3 as type, id, confirm, updatedAt
        FROM FollowBlogs
        WHERE
            follower_id=${userId}
    ) AS X
    `
    let [{ numOfUnconfirm, total }] = await seq.query(query, { type: QueryTypes.SELECT })

    return { numOfUnconfirm, total }
}

async function _init_newsOfComfirmRoNot(newsList) {
    let res = { unconfirm: [], confirm: [] }

    if (!newsList.length) {
        return res
    }

    let listOfPromise = newsList.map(_init_newsItemOfComfirmRoNot)

    listOfPromise = await Promise.all(listOfPromise)

    res = listOfPromise.reduce((initVal, currVal, index) => {
        let { confirm } = currVal
        confirm && initVal.confirm.push(currVal)
        !confirm && initVal.unconfirm.push(currVal)
        return initVal
    }, res)

    return res
}

async function _init_newsItemOfComfirmRoNot(item) {
    let { type, id, target_id, follow_id, confirm, time } = item
    let timestamp = moment(time, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
    let res = { type, id, timestamp, confirm }
    if (type === 1) {
        let { id: fans_id, nickname } = await readUser({ id: follow_id })
        return { ...res, fans: { id: fans_id, nickname } }
    } else if (type === 2) {
        let { id: blog_id, title, author } = await readBlogById(target_id)
        return { ...res, blog: { id: blog_id, title, author: { id: author.id, nickname: author.nickname }}}
    }else if (type === 3) {
        let { id: comment_id, user, blog } = await readComment({id: target_id})
        return ({ ...res, comment: { id: comment_id, user, blog }})
    }
}

module.exports = {
    readNews,
    countNewsTotalAndUnconfirm
}
