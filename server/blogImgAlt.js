const { BlogImgAlt, BlogImg } = require('../db/mysql/model')
const { init_blogImgAlt } = require('../utils/init/blogImgAlt')

async function createBlogImgAlt({ blogImg_id, alt }){
    let data = { blogImg_id }
    if(alt){
        data.alt = alt
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    console.log('@ 尚未 JSON化 的 blogImgAlt => ', blogImgAlt)
    return await readBlogImgAlt({ id: blogImgAlt.id })
}

async function readBlogImgAlt({ id }){
    let where = { id }
    console.log(BlogImgAlt.findOne)
    let res = await BlogImgAlt.findByPk(1, {
        include: {
            model: BlogImg,
            attributes: ['id', 'blog_id', 'img_id', 'name']
        }
    })
    console.log('@ init => ', init_blogImgAlt(res))

    return
    let blogImgAlt = await BlogImgAlt.findOne({
        where: { id },
        include: {
            model: 'BlogImgs',
            attributes: ['id', 'blog_id', 'img_id', 'name']
        }
    })
    if(blogImgAlt){
        blogImgAlt = init_blogImgAlt(blogImgAlt)
    }
}

module.exports = {
    createBlogImgAlt,
    readBlogImgAlt
}
