const { 
    //  0406
    SuccModel, ErrRes, MyErr,
    ErrModel,
 } = require('../model')
const BlogImgAlt = require('../server/blogImgAlt')  //  0406
//  0406
async function add(data) {
    if(!Object.entries(data).length){
        throw MyErr(ErrRes.BLOG_IMG_ALT.CREATE.NO_DATA)
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    return new SuccModel({ data: blogImgAlt})
}
module.exports = {
    //  0406
    add,
    modifyBlogImgAlt,   //  0328
    cancelWithBlog,     //  0326
    
}

const { CACHE: { TYPE: { PAGE } }} = require('../conf/constant')
const Controller_BlogImg = require('./blogImg')
const { BLOG_IMG_ALT } = require('../model/errRes')

const Opts = require('../utils/seq_findOpts')


//  0328
async function modifyBlogImgAlt({id, blog_id, alt}) {
    let { opts , data } = Opts.BLOGIMGALT.modify({id, alt})
    let ok = await BlogImgAlt.updateBlogImgAlts(data, opts)
    if (!ok) {
        return new ErrModel(BLOG_IMG_ALT.UPDATE_ERR)
    }
    let cache = { [PAGE.BLOG]: [ blog_id ] }
    return new SuccModel({cache})
}
//  0326
async function cancelWithBlog(blogImg_id, blogImgAlt_list){
    let count = await BlogImgAlt.count(Opts.BLOGIMGALT.count(blogImg_id))
    if(!count){
        console.log('沒有count')
        return new ErrModel(BLOG_IMG_ALT.NOT_EXIST)
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
async function _removeBlogImgAlts(blogImgAlt_list){
    let ok = await BlogImgAlt.deleteBlogImgAlts(blogImgAlt_list)
    if(!ok){
        return new ErrModel(BLOG_IMG_ALT.REMOVE_ERR)
    }
    return new SuccModel()
}

