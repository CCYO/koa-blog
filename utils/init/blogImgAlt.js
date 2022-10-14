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
    
    return json
}

module.exports = {
    init_blogImgAlt
}