const {
    NEWS
} = require('../conf/constant')

function news(userId, lastTime, offset, limit=NEWS.LIMIT){
    return `
    SELECT type, id, target_id, follow_id, confirm, time
    FROM (
        SELECT 1 as type, P.id as id, P.idol_id as target_id , P.fans_id as follow_id, P.confirm as confirm, P.createdAt as time
        FROM FollowPeople P 
        WHERE P.idol_id=${userId} ${ time && `AND time < lastTime`}

        UNION

        SELECT 2 as type, B.id as id, B.blog_id as target_id, B.follower_id as follow_id, B.confirm as confirm, B.createdAt as time
        FROM FollowBlogs B
        WHERE B.follower_id=${userId} AND B.deletedAt IS NULL ${ time && `AND time < lastTime`}
    ) AS X
    ORDER BY confirm=1, time DESC
    LIMIT ${limit} OFFSET ${offset}
    `
}

function newsTotal(userId){
    return `
    SELECT COUNT(*) as total
    FROM (
        SELECT id
        FROM FollowPeople
        WHERE idol_id=${userId}

        UNION

        SELECT id
        FROM FollowBlogs
        WHERE follower_id=${userId} AND deletedAt IS NULL
    ) AS X
    `
}

module.exports = {
    news,
    newsTotal
}
    