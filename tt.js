let { Op } = require('sequelize')
let { init_comment_4_blog } = require('./utils/init/comment')
let { User, Comment, FollowComment, Blog, BlogImg } = require('./db/mysql/model/index')
const { readBlog } = require('./server/blog')
const { readBlogImg } = require('./server/blogImg')
const { readFans } = require('./server/followPeople')

go()

async function go() {
    try {
        let res = await readFans({ idol_id: 1 })
        console.log('@ => ', res)
    } catch (e) {
        console.log(e)
    }
}