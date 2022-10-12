let { Op } = require('sequelize')
let { init_comment_4_blog } = require('./utils/init/comment')
let { User, Comment, FollowComment, Blog, BlogImg } = require('./db/mysql/model/index')

let init = []
let arr = [
    { id: 1, pid: undefined },
    { id: 2, pid: undefined },
    { id: 21, pid: 2 },
    { id: 3, pid: undefined },
    { id: 31, pid: 3 },
    { id: 32, pid: 3 },
    { id: 321, pid: 32 },
    { id: 4, pid: undefined },
    { id: 41, pid: 4 },
    { id: 411, pid: 41 },
    { id: 4111, pid: 411 },
]



go()

async function go() {
    try {
        let blogImg = await BlogImg.findByPk(1)
        let blogImgAlt = await blogImg.createBlogImgAlt({ blogImg_id: 1 })
        console.log('@ => ', blogImgAlt )
    } catch (e) {
        console.log(e)
    }
}