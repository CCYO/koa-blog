module.exports = function (json) {
    let data = { ...json }
    let { id, alt, BlogImg } = data
    let { id: blogImg_id, img_id, blog_id, name } = BlogImg
    alt = alt ? alt : name
    return { id, img_id, blog_id, blogImg_id, alt, name }
}