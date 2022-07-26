
const {
    NEWS: {
        LIMIT
    }
} = require('../conf/constant')

async function newsList({ userId, offset = 0, whereOps, checkNewsAfterMarkTime}) {
    let { markTime, listOfexceptNewsId: {people, blogs} } = whereOps
    console.log('@whereOps => ', whereOps)
    let listOfPeopleId = people.join(',') || undefined
    let listOfBlogsId = blogs.join(',') || undefined
    
    // let mark = checkNewsAfterMarkTime ? '<' : '>'
    let where_time = `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`

    let query = `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt as time
        FROM FollowPeople P 
        WHERE idol_id=${userId}
            AND ${where_time}
            ${listOfPeopleId && ` AND id NOT IN (${listOfPeopleId})` || ''}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt as time
        FROM FollowBlogs B
        WHERE follower_id=${userId}
            AND deletedAt IS NULL
            AND ${where_time}
            ${listOfBlogsId && ` AND id NOT IN (${listOfBlogsId})` || ''}
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
        `SELECT COUNT(if(confirm < 1, true, null))`  :
        `SELECT COUNT(if(DATE_FORMAT('${markTime}', '%Y-%m-%d %T') < DATE_FORMAT(createdAt, '%Y-%m-%d %T'), true, null)) `

    let query = `
    ${select} as numOfUnconfirm, COUNT(*) as total
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
