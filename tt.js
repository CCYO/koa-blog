let { Op } = require('sequelize')
let { init_comment_4_blog } = require('./utils/init/comment')
let { User, Comment, FollowComment, Blog, BlogImg } = require('./db/mysql/model/index')
const { readBlog } = require('./server/blog')
const { readBlogImg } = require('./server/blogImg')

go()

async function go() {
    try {
        let blog = await readBlog({blog_id: 1}, true)
        
        console.log('@ => ', blog)
    } catch (e) {
        console.log(e)
    }
}