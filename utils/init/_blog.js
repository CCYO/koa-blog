const { init_user } = require('./user')
const { init_blogImgAlt } = require('./blogImgAlt')

function __init_blog(blog) {
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
    //  { Img, User, ...blog}
    let { BlogImgs: blogImgs, User: author, ...data } = json

    let res = { ...data }

    if(author){
        res.author = init_user(author)
    }

    res.imgs = []
    if(blogImgs && blogImgs.length){
        let imgList = blogImgs.map( blogimg => {
            let {
                name,
                id: blogImg_id,
                Img: {
                    id: img_id,
                    hash,
                    url
                },
                BlogImgAlts
            } = blogimg
            let blogImgAltList = init_blogImgAlt(BlogImgAlts)   // [{ id, alt },...]
            return { img_id, hash, url, blogImg_id, name, blogImgAltList }
        })
        imgList.reduce((initVal, {blogImgAltList, ...imgData}) => {
            blogImgAltList.forEach( blogImgAlt => {
                let img = {...blogImgAlt, ...imgData }
                if(!img.alt){
                    img.alt = img.name
                }
                initVal.push(img)
            })
            return initVal
        }, res.imgs)
    }

    return res
}

module.exports = {
    __init_blog
}