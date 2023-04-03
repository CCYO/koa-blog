const { FOLLOWBLOG } = require('../model/errRes')
const FollowBlog = require('../server/followBlog')
const Opts = require('../utils/seq_findOpts')
const User = require("../server/user")
const { SuccModel, ErrModel } = require('../model')


async function count(blog_id){
    let data = await FollowBlog.count(Opts.PUB_SCR.count(blog_id))
    return new SuccModel({ data })
}
async function removeSubscribers(blog_id) {
    // let deletedAt = new Date()
    // let data = { blog_id, deletedAt }
    let ok = await FollowBlog.deleteFollows(blog_id)
    // if(!ok){
    //     return new ErrModel(FOLLOWBLOG.CREATE_ERROR)
    // }
    return new SuccModel()
}
async function addSubscribers({ blog_id, fans }) {
    let data = fans.map( id => ({ blog_id, follower_id: id }))
    let ok = await FollowBlog.createFollows(data)
    if(!ok){
        return new ErrModel(FOLLOWBLOG.CREATE_ERROR)
    }
    return new SuccModel()
}

async function findFollowsByIdolFans({ idolId, fansId }) {
    let user = await User.readUser(Opts.USER.findArticleReaderByIdolFans({ idolId, fansId }))
    let data
    if (!user) {
        data = []
    } else {
        let follower = user.fans[0]
        data = follower.FollowBlog_B.map(({ FollowBlog }) => FollowBlog.id)
    }
    return new SuccModel({ data })
}

module.exports = {
    count, 
    removeSubscribers,      //  0326
    addSubscribers,         //  0326
    findFollowsByIdolFans   //  0326
}