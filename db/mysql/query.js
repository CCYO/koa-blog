const { QueryTypes } = require('sequelize')
const moment = require('moment')

const {
    NEWS: {
        LIMIT
    }
} = require('../../conf/constant')

const { seq } = require('./model')

const { readUser } = require('../../server/user')
const { readBlog } = require('../../server/blog')
const { readComment } = require('../../server/comment')

async function _readNews({ userId, excepts}) {
    let { people, blogs, comments } = excepts
    let listOfPeopleId = people.join(',') || undefined
    let listOfBlogsId = blogs.join(',') || undefined
    let listOfCommentsId = comments.join(',') || undefined

    let query = `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt as time
        FROM FollowPeople
        WHERE idol_id=${userId}
            ${listOfPeopleId && ` AND id NOT IN (${listOfPeopleId})` || ''}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt as time
        FROM FollowBlogs
        WHERE follower_id=${userId}
            AND deletedAt IS NULL
            ${listOfBlogsId && ` AND id NOT IN (${listOfBlogsId})` || ''}

        UNION

        SELECT 3 as type, id, comment_id as target_id, follower_id as follow_id, confirm, updatedAt as time
        FROM FollowComments
        WHERE follower_id=${userId}
            ${listOfCommentsId && ` AND id NOT IN (${listOfCommentsId})` || ''}

    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${LIMIT}
    `
    let newsList = await seq.query(query, { type: QueryTypes.SELECT })

    return await _init_newsOfComfirmRoNot(newsList)
}

async function _count({ userId, excepts }) {
    let { people, blogs, comments } = excepts
    let listOfPeopleId = people.join(',') || undefined
    let listOfBlogsId = blogs.join(',') || undefined
    let listOfCommentsId = comments.join(',')



    let query = `
    SELECT
        COUNT(if(confirm < 1, true, null)) as unconfirm, 
        COUNT(if(confirm = 1, true, null)) as confirm, 
        COUNT(*) as total
    FROM (
        SELECT 1 as type, id, confirm, createdAt
        FROM FollowPeople
        WHERE
            idol_id=${userId} 
            ${listOfPeopleId && ` AND id NOT IN (${listOfPeopleId})` || ''}
        UNION

        SELECT 2 as type, id, confirm, createdAt
        FROM FollowBlogs
        WHERE 
            follower_id=${userId}
            AND deletedAt IS NULL 
            ${listOfBlogsId && ` AND id NOT IN (${listOfBlogsId})` || ''}
        UNION

        SELECT 3 as type, id, confirm, updatedAt
        FROM FollowComments
        WHERE
            follower_id=${userId}
            ${listOfCommentsId && ` AND id NOT IN (${listOfCommentsId})` || ''}
    ) AS X
    `
    let [{ unconfirm, confirm, total }] = await seq.query(query, { type: QueryTypes.SELECT })
    return { num: {unconfirm, confirm, total }}
}


async function readNews({ userId, options }) {
    let { markTime, fromFront, listOfexceptNewsId: { people, blogs, comments } } = options
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
        FROM FollowComments
        WHERE follower_id=${userId}
            AND ${where_time}
            ${listOfCommentsId && ` AND id NOT IN (${listOfCommentsId})` || ''}

    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${LIMIT}
    `
    let newsList = await seq.query(query, { type: QueryTypes.SELECT })

    return await _init_newsOfComfirmRoNot(newsList, fromFront)
}



async function countNewsTotalAndUnconfirm({ userId, options }) {
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
            idol_id=${userId} 

        UNION

        SELECT 2 as type, id, confirm, createdAt
        FROM FollowBlogs
        WHERE 
            follower_id=${userId}
            AND deletedAt IS NULL 

        UNION

        SELECT 3 as type, id, confirm, updatedAt
        FROM FollowComments
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
        if (!currVal) {
            return initVal
        }
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
        let { id: blog_id, title, author } = await readBlog({ blog_id: target_id })
        return { ...res, blog: { id: blog_id, title, author: { id: author.id, nickname: author.nickname } } }
    } else if (type === 3) {

        let [comment] = await readComment({ id: target_id })

        if (!comment) {
            return null
        }
        let { id: comment_id, p_id, createdAt, time, user, blog } = comment
        let other_comments = await readComment({ p_id, createdAt })
        if(other_comments.length){
            console.log('@有其他')
            let num = other_comments.length
            let names = other_comments.map( ({user, id}) => ({nickname: user.nickname, id}))
            return { ...res, comment: { id: comment_id, user, blog, time, num, names, other_comments} }
        }
        console.log('@沒有其他')

        return { ...res, comment: { id: comment_id, user, blog, time } }
    }
}

module.exports = {
    _readNews,
    _count,
    readNews,
    countNewsTotalAndUnconfirm
}
