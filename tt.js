let { Op } = require('sequelize')

const { User, Blog, FollowBlog } = require('./db/mysql/model')
const C_Comment = require('./controller/comment')

go()

async function go() {
    try {
        let a = await C_Comment.findBlogsOfCommented(1)
        console.log(a)
    } catch (e) {
        console.log(e)
    }
}