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
    let res = blogImg.toJSON ? blogImg.toJSON() : blogImg
    //  { id, img_id, blog_id, name }
    return res
}

module.exports = {
    init_blogImg
}