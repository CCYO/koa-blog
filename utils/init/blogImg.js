const { init_img } = require('./img')
const { init_blog } = require('./blog')

function init_blogImg(blogImg) {
    if (blogImg instanceof Array) {
        let res = []

        blogImg.forEach(item => {
            res.push(_init_blogImg(item))
        })

        return res
    }

    return _init_blogImg(blogImg)
}

function _init_blogImg(blogImg) {
    let { id: blogImg_id, img_id, blog_id, name } = blogImg.toJSON ? blogImg.toJSON() : blogImg

    return { blogImg_id, img_id, blog_id, name }
}

module.exports = {
    init_blogImg
}