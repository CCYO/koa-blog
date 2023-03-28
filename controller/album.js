const { } = require('../conf/constant')
const { ALBUM, BLOG } = require('../conf/constant')
const { SuccModel } = require('../model')
const Blog = require('./blog')
const User = require('./user')

async function findAlbumList(userId) {
    let userRes = await User.findUser(userId)
    if (userRes.errno) {
        return userRes
    }
    let user = userRes.data
    let { data: albumList } = await Blog.findBlogsForUserPage(userId, { pagination: ALBUM.PAGINATION })
    let data = { user, albumList }
    return new SuccModel({ data })
}

module.exports = {
    findAlbumList
}