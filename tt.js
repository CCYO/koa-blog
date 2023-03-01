let { Op } = require('sequelize')
let { 
    User,
    Comment,
    FollowComment,
    Blog,
    BlogImg,
    BlogImgAlt
} = require('./db/mysql/model')

const Opts = require('./utils/seq_findOpts')

// const Blog = require('./server/blog')
go()

async function go() {
    try {
        const blog = await Blog.findAll({where: { id: 99}})
        console.log('@blog => ', blog)
    } catch (e) {
        console.log(e)
    }
}