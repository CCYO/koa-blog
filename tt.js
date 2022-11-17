let { Op } = require('sequelize')
let { 
    User,
    Comment,
    FollowComment,
    Blog,
    BlogImg,
    BlogImgAlt
} = require('./db/mysql/model')

const { readBlog } = require('./server/blog')
go()

async function go() {
    try {
        let blog = await readBlog({blog_id: 58})
        console.log('@blog => ', blog)
    } catch (e) {
        console.log(e)
    }
}