let { Op } = require('sequelize')

const { User, Blog, BlogImgAlt } = require('./db/mysql/model')
const C_Blog = require('./controller/blog')

go()

async function go() {
    try {
        let a = await BlogImgAlt.create({ blogImg_id: 27})
        console.log(a)
    } catch (e) {
        console.log(e)
    }
}