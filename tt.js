let { Op } = require('sequelize')

const { User, Blog, FollowBlog } = require('./db/mysql/model')
// const Opts = require('./utils/seq_findOpts')
const { init_user } = require('./utils/init')



const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        let user = await User.findOne({
            attributes: ['id'],
            where: { id: 2 },
            include: {
                association: 'FollowPeople_F',
                attributes: ['id'],
                where: {
                    id: 3
                },
                through: {
                    attributes: [],
                    // paranoid: false
                },
                // include: {
                //     attributes: ['id'],
                //     association: 'FollowBlog_B',
                //     where: { user_id: 1 },
                //     through: {
                //         attributes: ['id']
                //     }
                // }
            }
        })
        user = user.toJSON()
        console.log(user)
        // let follower = user.FollowPeople_F[0]
        // // console.log('@followers => ', followers)
        // let follows = follower.FollowBlog_B.map(({FollowBlog}) => FollowBlog.id)
        // // let follows = blogs.map(({FollowBlog}) => FollowBlog.id)
        // console.log(follows)
        // let res = followers.reduce( (acc, { followBlog_B }) => {
        //     // followBlog.map(({Follow}) => )
        //     acc.push(FollowBlog.id)
        //     return acc
        // }, [])
        // console.log(follows)
    } catch (e) {
        console.log(e)
    }
}