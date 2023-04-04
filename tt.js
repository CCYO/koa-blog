const { NEWS: { TYPE }} = require('./conf/constant')
let { Op } = require('sequelize')
const {
    seq,
    User,
    Blog,
    Comment,
    News
} = require('./db/mysql/model')
const C_U = require('./controller/user')
const Init = require('./utils/init')

go()

async function go() {
    try {
        let list = await User.findAll({ where: {}})
        console.log('@fansList => ', list)
    } catch (e) {
        console.log(e)
    }
}