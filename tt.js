let { Op } = require('sequelize')
const rawQuery = require('./db/mysql/query')
const { User, Blog, BlogImgAlt, FollowComment } = require('./db/mysql/model')
const C_User = require('./controller/user')

go()

async function go() {
    try {
        let newsList = await FollowComment.destroy({
            where: {
                id: { [Op.in]: [103, 104]}
            }
        })
        console.log(newsList)
    } catch (e) {
        console.log(e)
    }
}