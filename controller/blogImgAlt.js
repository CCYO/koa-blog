const {
    createBlogImgAlt,
    updateBlogImgAlt
} = require('../server/blogImgAlt')

const { SuccModel, ErrModel } = require('../model')
const { BLOGIMGALT } = require('../model/errRes')

async function addBlogImgAlt(blogImg_id, blog_id){
    let blogImgAlt = await createBlogImgAlt({blogImg_id})
    return new SuccModel(blogImgAlt, { blog: [blog_id]})
}

async function modifiedBlogImgAlt(id, blog_id, alt){
    let ok = await updateBlogImgAlt({alt}, {id})
    if(!ok){
        return new ErrModel(BLOGIMGALT.UPDATE_ERR)
    }
    return new SuccModel(null, { blog: [blog_id]})
}

async function deleteImgs(blog_id, cancelImgs, user_id){
    let { id, blogImg_id } = cancelImgs
    
    await readBlogImgAlt()

}

module.exports = { 
    addBlogImgAlt,
    modifiedBlogImgAlt,
    deleteImgs
}