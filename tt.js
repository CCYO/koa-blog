let { Op } = require('sequelize')

const { User, Blog, FollowBlog } = require('./db/mysql/model')
const C_User = require('./controller/user')

go()

async function go() {
    try {
        let a = await C_User.login('0324@gmail.com','tt309091238')
        console.log(a)
    } catch (e) {
        console.log(e)
    }
}