const Controller_User = require('../../controller/user')
const Controller_Blog = require('../../controller/blog')
const Controller_Comment = require('../../controller/comment')
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
const { readCommentForNews } = require('../../server/comment')

const Opts = require('../../utils/seq_findOpts')
const { MyErr } = require('../../model')

async function _initNewsItem(item, userId) {
    let { type, id, target_id, follow_id, confirm, createdAt } = item
    let timestamp = moment(createdAt, "YYYY-MM-DD[T]hh:mm:ss.sss[Z]").fromNow()
    let res = { type, id, timestamp, confirm }
    let resModel

    if (type === 1) {
        let resModel = await Controller_User.findUser(follow_id)
        if (resModel.errno) {
            throw resModel
        }
        return { ...res, fans: resModel.data }
    } else if (type === 2) {
        let resModel = await Controller_Blog.findBlog({ blog_id: target_id })
        if (resModel.errno) {
            throw resModel
        }
        return { ...res, blog: resModel.data }
    } else if (type === 3) {
        let resModel = await Controller_Comment.findCommentForNews(target_id)
        if (resModel.errno) {
            throw resModel
        }
        let {  } = resModel.data
        let { ...res, id: comment_id, time, commenter, blog, html } = comment
        //  獲取早前未確認到的comment資訊
        let other_comments = await Controller_Comment. readCommentForNews({ blog_id: blog.id, createdAt }, userId)
        // let other_comments = await readCommentForNews({ blog_id: blog.id, createdAt }, userId)
        let others = other_comments.length ? other_comments.map(comment => {
            let { commenter } = comment
            return commenter
        }) : []
        console.log('others => ', others)
        let x = { ...res, comment: { id: comment_id, commenter, html, blog, time, others } }
        console.log('x => ', x)
        return x
    }
}

async function readNews({ userId, excepts }) {
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
        SELECT 1 as type, id , target as target_id , follow as follow_id, confirm, createdAt
        FROM IdolFans
        WHERE 
            target=${userId}
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
        FROM IdolFans
        WHERE
            target=${userId} 
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

    let listOfPromise = newsList.map(news => _initNewsItem(news, userId))

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
