let { Op } = require('sequelize')

const { User, Blog, FollowBlog } = require('./db/mysql/model')
// const Opts = require('./utils/seq_findOpts')
const { init_user } = require('./utils/init')



const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        let password = 'f058cbde71eec7a368d8b5ce7da9a78c'
        let opts = {
            // ignoreDuplicates: true,
            updateOnDuplicate: ['id','email','password', 'updatedAt']
        }
        let user = await User.bulkCreate(
            [
                { id: 9, email: '99999@gmail.com', password }, 
                { id: 10, email: '101010@gmail.com', password },
                { id: 11, email: '111111@gmail.com', password }
            ],
            opts
        )
        console.log('x => ', user)
        let json = user.map( _ => _.toJSON())
        console.log('@ => ', json)
        users = await User.findAll({ where: { id: { [Op.in]: [9, 10]}}})
        json = users.map( _ => _.toJSON())
        console.log('@@ => ', json)
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