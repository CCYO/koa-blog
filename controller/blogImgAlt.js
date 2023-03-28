const { CACHE: { TYPE: { PAGE } }} = require('../conf/constant')
const Controller_BlogImg = require('./blogImg')
const { BLOGIMGALT: { UPDATE_ERR, REMOVE_ERR ,NOT_EXIST, CREATE_ERR } } = require('../model/errRes')
const { SuccModel, ErrModel } = require('../model')
const Opts = require('../utils/seq_findOpts')
const BlogImgAlt = require('../server/blogImgAlt')

//  0328
async function modifyBlogImgAlt({id, blog_id, alt}) {
    let { opts , data } = Opts.BLOGIMGALT.modify({id, alt})
    let ok = await BlogImgAlt.updateBlogImgAlts(data, opts)
    if (!ok) {
        return new ErrModel(UPDATE_ERR)
    }
    let cache = { [PAGE.BLOG]: [ blog_id ] }
    return new SuccModel({cache})
}
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
    return await _removeBlogImgAlts(blogImgAlt_list)
}
//  0326
async function addBlogImgAlt({ blogImg_id }) {
    let blogImgAlt = await BlogImgAlt.createBlogImgAlt({ blogImg_id })
    if(!blogImgAlt){
        return new ErrModel(CREATE_ERR)
    }
    return new SuccModel({ data: blogImgAlt})
}
//  0326
async function _removeBlogImgAlts(blogImgAlt_list){
    let ok = await BlogImgAlt.deleteBlogImgAlts(blogImgAlt_list)
    if(!ok){
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel()
}

module.exports = {
    modifyBlogImgAlt,   //  0328
    cancelWithBlog,     //  0326
    addBlogImgAlt,      //  0326
}