
const {
    NEWS
} = require('../conf/constant')

async function news({ userId, now = undefined, offset, limit = NEWS.LIMIT }) {
    
    let queryForPeople = 1
    let queryForBlogs = 1

    if(now){
        queryForPeople = queryForPeople = `DATE_FORMAT('${now}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`
    }

    let query = `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt as time
        FROM FollowPeople P 
        WHERE idol_id=${userId} AND ${queryForPeople}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt as time
        FROM FollowBlogs B
        WHERE follower_id=${userId} AND deletedAt IS NULL AND ${queryForBlogs}
    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${limit} OFFSET ${offset}
    `
    return query
}

async function newsTotal({ userId, now = undefined }) {
    let queryForPeople = 1
    let queryForBlogs = 1
console.log('@now => ', now)
    if(now){
        queryForPeople = queryForPeople = `DATE_FORMAT('${now}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`
    }
    
    let query = `
    SELECT COUNT(*) as total
    FROM (
        SELECT id
        FROM FollowPeople
        WHERE idol_id=${userId} AND ${queryForPeople}

        UNION

        SELECT id
        FROM FollowBlogs
        WHERE follower_id=${userId} AND deletedAt IS NULL AND ${queryForBlogs}
    ) AS X
    `
    return query
}

module.exports = {
    news,
    newsTotal
}
