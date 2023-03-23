const user = require('./user')

const {
    initComment,
    initCommentsForBrowser
} = require('./comment')
const { init_blog } = require('./blog')
const { init_img } = require('./img')
const { init_blogImg } = require('./blogImg')
const { init_newsOfFollowId, init_excepts} = require('./news')

module.exports = {
    user,

    initComment,
    initCommentsForBrowser,
    init_blog,
    init_img,
    init_blogImg,
    init_newsOfFollowId,
    init_excepts
}