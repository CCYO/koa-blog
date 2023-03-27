const Controller_BlogImg = require('./blogImg')
const { BLOGIMGALT: { REMOVE_ERR ,NOT_EXIST, CREATE_ERR } } = require('../model/errRes')
const { SuccModel, ErrModel } = require('../model')
const Opts = require('../utils/seq_findOpts')
const BlogImgAlt = require('../server/blogImgAlt')

//  0326
async function cancelWithBlog(blogImg_id, blogImgAlt_list){
    let count = await BlogImgAlt.count(Opts.BLOGIMGALT.count(blogImg_id))
    if(!count){
        console.log('沒有count')
        return new ErrModel(NOT_EXIST)
    }

    //  既存數量 = 要刪除的數量，刪除整筆 blogImg
    if(count === blogImgAlt_list.length){
        console.log('刪除整筆')
        return await Controller_BlogImg.removeBlogImg(blogImg_id)
    }
    console.log('刪除個別')
    //  各別刪除 blogImgAlt
    return await removeBlogImgAlts(blogImgAlt_list)
}
//  0326
async function removeBlogImgAlts(blogImgAlt_list){
    let ok = await BlogImgAlt.deleteBlogImgAlts(blogImgAlt_list)
    if(!ok){
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel()
}

async function addBlogImgAlt({blogImg_id, blog_id}) {
    let blogImgAlt = await BlogImgAlt.createBlogImgAlt({ blogImg_id })
    if(!blogImgAlt){
        return new ErrModel(CREATE_ERR)
    }
    return new SuccModel({ data: blogImgAlt})
}

async function modifiedBlogImgAlt(id, blog_id, alt) {
    let ok = await BlogImgAlt.updateBlogImgAlt({ alt }, { id })
    if (!ok) {
        return new ErrModel(BLOGIMGALT.UPDATE_ERR)
    }
    return new SuccModel(null, { blog: [blog_id] })
}

module.exports = {
    cancelWithBlog,     //  0326
    addBlogImgAlt,      //  0326
    modifiedBlogImgAlt,
}