const {
    createBlogImgAlt,
    updateBlogImgAlt
} = require('../server/blogImgAlt')

const { SuccModel, ErrModel } = require('../model')
const { BLOGIMGALT } = require('../model/errRes')

async function addBlogImgAlt(blogImg_id){
    let blogImgAlt = await createBlogImgAlt({blogImg_id})
    return new SuccModel(blogImgAlt, { blog: [blogImgAlt.blog_id]})
}

async function modifiedBlogImgAlt(id, blog_id, alt){
    let ok = await updateBlogImgAlt({alt}, {id})
    if(!ok){
        return new ErrModel(BLOGIMGALT.UPDATE_ERR)
    }
    return new SuccModel(null, { blog: [blog_id]})
}

module.exports = { 
    addBlogImgAlt,
    modifiedBlogImgAlt
}