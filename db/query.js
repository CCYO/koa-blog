
const {
    NEWS: {
        LIMIT
    }
} = require('../conf/constant')

async function newsList({ userId, offset = 0, whereOps, checkNewsAfterMarkTime}) {
    let { markTime, exceptNewsList } = whereOps
    let exceptNewsList_4_people = exceptNewsList.people.length && exceptNewsList.people.join(',') || undefined
    let exceptNewsList_4_blogs = exceptNewsList.blogs.length && exceptNewsList.blogs.join(',') || undefined

    // let mark = checkNewsAfterMarkTime ? '<' : '>'
    let where_time = `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`
    let where_exceptNewsListOfPeople = exceptNewsList_4_people && ` AND id NOT IN (${exceptNewsList_4_people})` || ''
    let where_exceptNewsListOfBlogs = exceptNewsList_4_blogs && ` AND id NOT IN (${exceptNewsList_4_blogs})` || ''

    let query = `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt as time
        FROM FollowPeople P 
        WHERE idol_id=${userId} AND ${where_time}  ${where_exceptNewsListOfPeople}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt as time
        FROM FollowBlogs B
        WHERE follower_id=${userId} AND deletedAt IS NULL AND ${where_time} ${where_exceptNewsListOfBlogs}
    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${LIMIT} OFFSET ${offset}
    `
    return query
}

async function newsTotal({ userId, markTime, checkNewsAfterMarkTime}) {
    
    // let mark = checkNewsAfterMarkTime ? '<' : '>'
    // let where_time = checkNewsAfterMarkTime ? `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T')` : 1
    let select = 
        !checkNewsAfterMarkTime ?
        `SELECT COUNT(if(confirm < 1, true, null)) as numOfUnconfirm, COUNT(*) as total ` :
        `SELECT COUNT(if(DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T'), true, null)) as numOfAfterMark, COUNT(*) as total `

    let query = `
    ${select}
    FROM (
        SELECT 1 as type, id, confirm, createdAt
        FROM FollowPeople
        WHERE idol_id=${userId} 

        UNION

        SELECT 2 as type, id, confirm, createdAt
        FROM FollowBlogs
        WHERE follower_id=${userId} AND deletedAt IS NULL 
    ) AS X
    
    `
    return query
}

module.exports = {
    newsList,
    newsTotal
}
