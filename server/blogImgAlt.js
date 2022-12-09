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

async function deleteBlogImgAlt(whereOps){
    let row = await BlogImgAlt.destroy({where: whereOps})
    if(row !== whereOps.id.length){
        return false
    }
    return true
}

async function updateBlogImgAlt(data, whereOps){
    let options = { where: { ...whereOps }}
    let [row] = await BlogImgAlt.update(data, options)
    if(!row){
        return false
    }
    return true
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

async function courtOfSomeImgInBlog({blog_id, blogImg_id}){
    let {} = await BlogImgAlt.findAndCountAll({
        where: { blogImg_id }
    })
}

module.exports = {
    createBlogImgAlt,
    deleteBlogImgAlt,
    updateBlogImgAlt,
    readBlogImgAlt
}
