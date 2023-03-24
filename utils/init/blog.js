const { init_user } = require('./user')
const { init_comment_4_blog } = require('./comment')
const { init_blogImgAlt } = require('./blogImgAlt')

function init_blog(blog) {
    if (!blog) {
        return null
    }
    return _init(blog)
}

function init_blogs(blogs) {
    if (!blogs.length) {
        return []
    }
    return blogs.map(blog => init_blog(blog))
}

// function init_blog(blog) {
//     if(!blog){
//         return null
//     }
//     if (blog instanceof Array) {
//         if(!blog.length){
//             return []
//         }
//         return blog.map(item => _init_blog(item) )
//     }
//     return _init_blog(blog)
// }

function _init(blog) {
    let json = blog.toJSON()
    // let map = new Map(Object.entries(json))
    return json
    //  { Img, User, Comment, ...blog}
    let { BlogImgs: blogImgs, User: author, Comments: comments, ...data } = json

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
    if(comments && comments.length){
        res.comments = init_comment_4_blog(comments)
    }else{
        res.comments = []
    }

    return res
}

module.exports = (blog) => {
    if (Array.isArray(blog)) {
        return init_blogs(blog)
    } else {
        return init_blog(blog)
    }
}