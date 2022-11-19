const { createBlogImgAlt } = require('../server/blogImgAlt')

const { SuccModel, ErrModel } = require('../model')

async function addBlogImgAlt(blogImg_id){
    let blogImgAlt = await createBlogImgAlt({blogImg_id})
    return new SuccModel(blogImgAlt, { blog: [blogImgAlt.blog_id]})
}

module.exports = { addBlogImgAlt }