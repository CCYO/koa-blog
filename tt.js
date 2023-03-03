let { Op } = require('sequelize')
let { 
    User,
    // Comment,
    FollowComment,
    // Blog,
    BlogImg,
    BlogImgAlt
} = require('./db/mysql/model')

const Opts = require('./utils/seq_findOpts')

const Comment = require('./controller/comment')
const Cache = require('./server/cache')
const hiddenRemovedComments = require('./utils/hiddenRemovedComments')
go()

async function go() {
    try {
        let blog = await Cache.getEtag('blogPage/4')
        console.log('@comments => ', blog)
    } catch (e) {
        console.log(e)
    }
}