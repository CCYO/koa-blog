let { Op } = require('sequelize')
const rawQuery = require('./db/mysql/query')
const { User, Blog, BlogImgAlt, FollowComment, seq } = require('./db/mysql/model')
const C_comment = require('./controller/comment')
const C_FollowComment = require('./controller/followComment')
const Init = require('./utils/init')

go()

async function go() {
    try {
        let re = await C_FollowComment.findItemsByTargets({ comment_ids: [1]}, { exclude: { follower_id: [2] }} )
        console.log(re)
    } catch (e) {
        console.log(e)
    }
}