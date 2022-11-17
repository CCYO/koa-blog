function init_blogImgAlt(blogImgAlt) {
    if (blogImgAlt instanceof Array) {
        let res = []

        blogImgAlt.forEach(item => {
            res.push(_init_blogImgAlt(item))
        })

        return res
    }

    return _init_blogImgAlt(blogImgAlt)
}

function _init_blogImgAlt(blogImgAlt) {
    let json = blogImgAlt.toJSON ? blogImgAlt.toJSON() : blogImgAlt
    let { id, alt, BlogImg } = json
    let res = { id, alt }
    if(!BlogImg){
        return res
    }
    let { id: blogImg_id, img_id, blog_id, name } = BlogImg
    if(!alt){
        alt = name
    }
    return { id, img_id, blog_id, blogImg_id, alt, name }
}

module.exports = {
    init_blogImgAlt
}