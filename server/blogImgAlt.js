const { BlogImgAlt, BlogImg } = require('../db/mysql/model')
const { init_blogImgAlt } = require('../utils/init/blogImgAlt')

async function createBlogImgAlt({ blogImg_id, alt }){
    let data = { blogImg_id }
    if(alt){
        data.alt = alt
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    return await readBlogImgAlt({ id: blogImgAlt.dataValues.id })
}

async function readBlogImgAlt({ id }){
    let where = { id }

    let blogImgAlt = await BlogImgAlt.findOne({
        where,
        include: {
            model: BlogImg,
            attributes: ['id', 'blog_id', 'img_id', 'name']
        }
    })
    
    if(!blogImgAlt){
        return null
    }

    return init_blogImgAlt(blogImgAlt)
}

module.exports = {
    createBlogImgAlt,
    readBlogImgAlt
}
