let { Op } = require('sequelize')

const { User, Blog, FollowBlog } = require('./db/mysql/model')
const C_Blog = require('./controller/blog')

go()

async function go() {
    try {
        let a = await C_Blog.findBlogsForUserPage(1)
        console.log(a)
    } catch (e) {
        console.log(e)
    }
}