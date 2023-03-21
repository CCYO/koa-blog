const Opts = require('../utils/seq_findOpts')
const User = require("../server/user")
const { SuccModel } = require('../model')

async function findFollowsByIdolFans({ idol_id, fans_id }) {
    let user = await User.readUser(Opts.USER.findArticleReaderByIdolFans({ idol_id, fans_id }))
    let data
    if (!user) {
        data = []
    } else {
        let follower = user.FollowPeople_F[0]
        data = follower.FollowBlog_B.map(({ FollowBlog }) => FollowBlog.id)
    }
    return new SuccModel({ data })
}

module.exports = {
    findFollowsByIdolFans
}