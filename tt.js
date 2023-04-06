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
const C_B = require('./controller/blog')
const Init = require('./utils/init')

go()

async function go() {
    try {
        let resModel = await C_B.findReadersAndFansListAndFans({author_id: 1, blog_id: 1})
        console.log('@resModel => ', resModel)
    } catch (e) {
        console.log(e)
    }
}