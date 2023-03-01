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

const Opts = require('../../utils/seq_findOpts')

async function readNews({ userId, excepts }) {
    // let { people, blogs, comments } = excepts
    let list = { people: '', blogs: '', comments: ''}
    if(excepts){
        for( key in list ){
            list[key] = excepts[key].length && ` AND id NOT IN (${excepts[key].join(',')})` || ''
        }
    }

    let query = `
    SELECT type, id, target_id, follow_id, confirm, createdAt
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt
        FROM FollowPeople
        WHERE 
            idol_id=${userId}
            ${list.people}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt 
        FROM FollowBlogs
        WHERE 
            follower_id=${userId}
            AND deletedAt IS NULL
            ${list.blogs}

        UNION

        SELECT 3 as type, id, comment_id as target_id, follower_id as follow_id, confirm, createdAt 
        FROM FollowComments
        WHERE 
            follower_id=${userId}
            ${list.comments}

    ) AS X
    ORDER BY confirm=1, createdAt DESC
    LIMIT ${LIMIT}
    `
    let newsList = await seq.query(query, { type: QueryTypes.SELECT })

    return await _init_newsOfComfirmRoNot(newsList, userId)
}

async function count({ userId }) {
    let query = `
    SELECT
        COUNT(if(confirm < 1, true, null)) as unconfirm, 
        COUNT(if(confirm = 1, true, null)) as confirm, 
        COUNT(*) as total
    FROM (
        SELECT 1 as type, id, confirm
        FROM FollowPeople
        WHERE
            idol_id=${userId} 
        UNION

        SELECT 2 as type, id, confirm
        FROM FollowBlogs
        WHERE 
            follower_id=${userId}
            AND deletedAt IS NULL 
        UNION

        SELECT 3 as type, id, confirm
        FROM FollowComments
        WHERE
            follower_id=${userId}
    ) AS X
    `
    let [{ unconfirm, confirm, total }] = await seq.query(query, { type: QueryTypes.SELECT })
    
    return { num: { unconfirm, confirm, total } }
}

async function _init_newsOfComfirmRoNot(newsList, userId) {
    let res = { unconfirm: [], confirm: [] }

    if (!newsList.length) {
        return res
    }

    let listOfPromise = newsList.map( news => _init_newsItemOfComfirmRoNot(news, userId))

    listOfPromise = await Promise.all(listOfPromise)

    res = listOfPromise.reduce((initVal, currVal) => {
        if (!currVal) {
            return initVal
        }
        let { confirm } = currVal
        confirm && initVal.confirm.push(currVal) || initVal.unconfirm.push(currVal)
        return initVal
    }, res)
    
    return res
}

async function _init_newsItemOfComfirmRoNot(item, userId) {
    let { type, id, target_id, follow_id, confirm, createdAt } = item
    let timestamp = moment(createdAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
    let res = { type, id, timestamp, confirm }
    if (type === 1) {
        let { id: fans_id, nickname } = await readUser(Opts.findUser(follow_id))
        return { ...res, fans: { id: fans_id, nickname } }
    } else if (type === 2) {
        let { id: blog_id, title, author } = await readBlog(Opts.findBlog(target_id))
        return { ...res, blog: { id: blog_id, title, author: { id: author.id, nickname: author.nickname } } }
    } else if (type === 3) {
        let [comment] = await readComment(Opts.findComment(target_id))
        if (!comment) {
            return null
        }
        let { id: comment_id, time, user, blog } = comment
        //  獲取早前未確認到的comment資訊
        let other_comments = await readComment({ blog_id: blog.id, createdAt }, userId)
        let others = other_comments.length ? other_comments.filter(({user}) => user.nickname) : []
        
        return { ...res, comment: { id: comment_id, user, blog, time, others } }
    }
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

module.exports = {
    readNews,
    count,
    countNewsTotalAndUnconfirm
}
