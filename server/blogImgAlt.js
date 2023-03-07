const { BlogImgAlt } = require('../db/mysql/model')

const { init_blogImgAlt } = require('../utils/init/blogImgAlt')

async function createBlogImgAlt({ blogImg_id, alt }){
    let data = { blogImg_id }
    if(alt){
        data.alt = alt
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    return await readBlogImgAlt({ id: blogImgAlt.dataValues.id })
}

async function deleteBlogImgAlt({ blogImgAlt_list }){
    // let opts = { where }
    // let row = await BlogImgAlt.destroy(opts)
    // if(row !== whereOps.id.length){
    //     return false
    // }
    // return true

    let [{affectedRows}] = await seq.getQueryInterface().bulkDelete('BlogImgAlt', {
        id: { [Op.in]: blogImgAlt_list }
    })
    
    if(affectedRows !== blogImgAlt_list.length ){
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

async function readBlogImgAlt({ where, attributes }){
    let opts = { where }
    if (attributes) {
        opts.attributes = attributes
    }

    let blogImgAlts = await BlogImgAlt.findAll(opts)
    
    return blogImgAlts.map( init_blogImgAlt )
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
