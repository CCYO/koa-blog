const Opts = require('../utils/seq_findOpts')
const User = require("../server/user")
const { SuccModel } = require('../model')

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
    findFollowsByIdolFans
}