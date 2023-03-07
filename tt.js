let { Op } = require('sequelize')
let { 
    // User,
    // Comment,
    FollowComment,
    // Blog,
    BlogImg,
    BlogImgAlt
} = require('./db/mysql/model')

const Opts = require('./utils/seq_findOpts')

const Blog = require('./controller/blog')
// const User = require('./server/user')
const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        let blogs = await Blog.getSquareBlogList(1)
        
        console.log('@blogs => ', blogs)
    } catch (e) {
        console.log(e)
    }
}