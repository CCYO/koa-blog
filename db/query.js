
const {
    NEWS
} = require('../conf/constant')

async function news({ userId, markTime, offset, limit = NEWS.LIMIT }) {

    let where_time = `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`


    let query = `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt as time
        FROM FollowPeople P 
        WHERE idol_id=${userId} AND ${where_time}

        UNION

        SELECT 2 as type, id, blog_id as target_id, follower_id as follow_id, confirm, createdAt as time
        FROM FollowBlogs B
        WHERE follower_id=${userId} AND deletedAt IS NULL AND ${where_time}
    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${limit} OFFSET ${offset * limit}
    `
    return query
}

async function newsTotal({ userId, markTime}) {
    
    let where_time = `DATE_FORMAT('${markTime}', '%Y-%m-%d %T') > DATE_FORMAT(createdAt, '%Y-%m-%d %T')`
    

    let query = `
    SELECT COUNT(*) as total
    FROM (
        SELECT id
        FROM FollowPeople
        WHERE idol_id=${userId} AND ${where_time}

        UNION

        SELECT id
        FROM FollowBlogs
        WHERE follower_id=${userId} AND deletedAt IS NULL AND ${where_time}
    ) AS X
    `
    return query
}

module.exports = {
    news,
    newsTotal
}
