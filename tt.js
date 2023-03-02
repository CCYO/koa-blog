let { Op } = require('sequelize')
let { 
    User,
    // Comment,
    FollowComment,
    // Blog,
    BlogImg,
    BlogImgAlt
} = require('./db/mysql/model')

const Opts = require('./utils/seq_findOpts')

const Comment = require('./controller/comment')
const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        const { errno, data } = await Comment.getCommentsByBlogId(4)
        const comments = hiddenRemovedComments(data)

        console.log('@comments => ', comments[0].reply)
    } catch (e) {
        console.log(e)
    }
}