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
    let json = blogImg.toJSON ? blogImg.toJSON() : blogImg
    console.log('@json => ', json)
    return json
    let { id, Imgs, Blogs, name , ...data} = json
    // let img = init_img(Imgs)
    // let blog = init_blog(Blogs)
    return { id, img, blog, ...data}
    // const { id, hash, url } = json_blogImg

    // return { id, hash, url }
}

module.exports = {
    init_blogImg
}