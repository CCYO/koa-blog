let { Op } = require('sequelize')
const rawQuery = require('./db/mysql/query')
const { User, Blog, BlogImgAlt } = require('./db/mysql/model')
const C_User = require('./controller/user')

go()

async function go() {
    try {
        let newsList = await rawQuery.readNews({ userId: 2})
        console.log(newsList)
    } catch (e) {
        console.log(e)
    }
}