let { Op } = require('sequelize')

const { User, Blog } = require('./db/mysql/model')
// const Opts = require('./utils/seq_findOpts')
const { init_user } = require('./utils/init')



const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        let user = await User.findAll({
            attributes: ['id'],
            include: {
                where: { follower_id: 3},
                attributes: ['id'],
                association: 'FollowPeople_F',
                include: {
                    association: 'FollowBlog_B',
                    attributes: ['id'],
                    through: {
                        where: { user_id: 1 }
                    }
                }
            }
        })
        console.log(user)
    } catch (e) {
        console.log(e)
    }
}