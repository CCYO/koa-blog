const { init_user } = require('./user')
const { init_comment } = require('./comment')

function init_blog(blog) {
    if (blog instanceof Array) {
        let res = []

        if(!blog.length){
            return []
        }

        blog.forEach(item => {
            res.push(_init_blog(item))
        })

        return res
    }

    if(!blog.id){
        return {}
    }
    
    return _init_blog(blog)
}

function _init_blog(blog) {
    let json = blog.toJSON ? blog.toJSON() : blog
    //  { Img, User, Comment, ...blog}
    let { Imgs: imgList, User: author, Comments: comments, ...data } = json

    let res = { ...data }

    if(author){
        res.author = init_user(author)
    }

    if(imgList && imgList.length){
        res.imgs = imgList.reduce((initVal, curVal, index) => {
            let { BlogImg: { id: blogImg_id, name }, ...img } = curVal
            initVal.push({ ...img, blogImg_id, name })
            return initVal
        }, [])
    }else{
        res.imgs = []
    }

    if(comments && comments.length){
        res.comments = init_comment(comments, true)
    }else{
        res.comments = []
    }

    return res
}

module.exports = {
    init_blog
}