let { Op } = require('sequelize')
let { 
    User,
    Comment,
    FollowComment,
    Blog,
    BlogImg,
    BlogImgAlt
} = require('./db/mysql/model/index')
go()

async function go() {
    try {
        let blogImgAlt_1 = await BlogImgAlt.build({ blogImg: 42, alt: '42-1'})
        let blogImgAlt_2 = await BlogImgAlt.build({ blogImg: 42, alt: '42-1'})
        console.log('@ => ', blogImgAlt_1, blogImgAlt_2)
    } catch (e) {
        console.log(e)
    }
}