const { ALBUM } = require('../conf/constant')
//  0411
async function findList(author_id, options) {
    // data: { author, albums } 
    let { data } = await Blog.findInfoForPageOfAlbumList(author_id, options)
    return new SuccModel({ data })
}

module.exports = {
    findList
}

const { SuccModel } = require('../model')
const Blog = require('./blog')
const User = require('./user')

