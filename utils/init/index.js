const { init_user } = require('./user')
const { init_comment } = require('./comment')
const { init_blog } = require('./blog')
const { init_img } = require('./img')
const { init_blogImg } = require('./blogImg')
const { init_newsOfFollowId, init_excepts} = require('./news')

module.exports = {
    init_user,
    init_comment,
    init_blog,
    init_img,
    init_blogImg,
    init_newsOfFollowId,
    init_excepts
}