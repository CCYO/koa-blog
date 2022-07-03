const {
    NEWS
} = require('../conf/constant')

function query(userId, offset, limit = NEWS.LIMIT){
    return `
    SELECT id, idol_id, fans_id, blog_id, follower_id, confirm, time
    FROM (
        SELECT P.id as id, P.idol_id, P.fans_id, B.blog_id, B.follower_id, P.confirm as confirm, P.createdAt as time
        FROM FollowPeople P LEFT JOIN FollowBlogs B
        ON B.id = null      
        WHERE P.idol_id=${userId}
        UNION
        SELECT B.id as id, P.idol_id, P.fans_id, B.blog_id, B.follower_id, B.confirm as confirm, B.createdAt as time
        FROM FollowPeople P RIGHT JOIN FollowBlogs B
        ON P.id = null
        WHERE B.follower_id=${userId} AND B.deletedAt IS NULL
    ) AS A
    ORDER BY time DESC
    LIMIT ${limit} OFFSET ${offset}
    `
}

module.exports = {
    query
}
    