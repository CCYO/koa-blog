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

const comment = require('./controller/comment')
// const User = require('./server/user')
const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        let blogs = await comment.addComment({ user_id: 5, blog_id: 9, author: 2})
        
        // console.log('@blogs => ', blogs)
    } catch (e) {
        console.log(e)
    }
}