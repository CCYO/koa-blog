let { Op } = require('sequelize')
let { init_comment_4_blog } = require('./utils/init/comment')
let { User, Comment, FollowComment, Blog, BlogImg } = require('./db/mysql/model/index')
const { readBlog } = require('./server/blog')
const { readBlogImg } = require('./server/blogImg')
const { readFans } = require('./server/followPeople')

go()

async function go() {
    try {
        let comment = await Comment.build({ title: '896', user_id: 1, blog_id: 1})
        let res = comment.toJSON()
        console.log('@ => ', res)
    } catch (e) {
        console.log(e)
    }
}