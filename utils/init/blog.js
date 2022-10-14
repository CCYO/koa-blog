const { init_user } = require('./user')
const { init_comment_4_blog } = require('./comment')
const { init_blogImgAlt } = require('./blogImgAlt')

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
    let { BlogImgs: blogImgs, User: author, Comments: comments, ...data } = json

    let res = { ...data }

    if(author){
        res.author = init_user(author)
    }

    if(blogImgs && blogImgs.length){
        res.imgs = blogImgs.map( blogimg => {
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
            let blogImgAltList = init_blogImgAlt(BlogImgAlts)
            return { img_id, name, hash, url, blogImg_id }
        })
    }else{
        res.imgs = []
    }

    // if(imgList && imgList.length){
    //     res.imgs = imgList.reduce((initVal, curVal, index) => {
    //         let { BlogImg: { id: blogImg_id }, id, hash, url } = curVal
            
    //         initVal.push({ id, hash, url, blogImg_id })
    //         return initVal
    //     }, [])
    //     console.log('@imgs => ', res.imgs)
    // }else{
    //     res.imgs = []
    // }

    if(comments && comments.length){
        res.comments = init_comment_4_blog(comments)
    }else{
        res.comments = []
    }

    return res
}

module.exports = {
    init_blog
}