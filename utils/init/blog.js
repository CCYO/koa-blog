const { init_user } = require('./user')
const { init_comment } = require('./comment')

function init_blog(blog) {
    if (blog instanceof Array) {
        let res = []

        blog.forEach(item => {
            res.push(_init_blog(item))
        })

        return res
    }

    return _init_blog(blog)
}

function _init_blog(blog) {
    let json = blog.toJSON ? blog.toJSON() : blog
    //  { Img, User, Comment, ...blog}
    let { Imgs: imgList, User: author, Comments: comments, ...data } = json
    author = init_user(author)

    let imgs = imgList && imgList.length && imgList.reduce((initVal, curVal, index) => {
        let { BlogImg: { id: blogImg_id, name }, ...img } = curVal
        initVal.push({ ...img, blogImg_id, name })
        return initVal
    }, []) || imgList

    let res = { ...data, imgs, author }

    if(comments){
        res.comments = init_comment(comments)
    }

    return res
}

module.exports = {
    init_blog
}