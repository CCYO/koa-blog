let { Op } = require('sequelize')
const rawQuery = require('./db/mysql/query')
const { User, Blog, BlogImgAlt, FollowComment, seq } = require('./db/mysql/model')
const C_User = require('./controller/user')
const Init = require('./utils/init')

go()

async function go() {
    try {
        let user = await User.findByPk(1)
        user = Init.user(user)
        console.log(user)
    } catch (e) {
        console.log(e)
    }
}