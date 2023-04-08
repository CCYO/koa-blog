const Opts = require('../utils/seq_findOpts')                       //  0408
const { ErrModel, SuccModel, ErrRes, MyErr } = require('../model')  //  0408
const BlogImgAlt = require('../server/blogImgAlt')                  //  0406
//  0408
async function removeList(id_list) {
    let raw = await BlogImgAlt.deleteList(Opts.FOLLOW.removeList(id_list))
    if(id_list.length !== raw){
        throw new MyErr(ErrRes.BLOG_IMG_ALT.DELETE.ROW)
    }
    return new SuccModel({ data: raw })
}
//  0408
async function count(blogImg_id){
    let data = await BlogImgAlt.count(Opts.BLOG_IMG_ALT.count(blogImg_id))
    if(!data){
        return new ErrModel(ErrRes.BLOG_IMG_ALT.READ.NOT_EXIST)
    }
    return new SuccModel({ data })
}
//  0406
async function add(data) {
    if(!Object.entries(data).length){
        throw MyErr(ErrRes.BLOG_IMG_ALT.CREATE.NO_DATA)
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    return new SuccModel({ data: blogImgAlt})
}
module.exports = {
    //  0408
    removeList,
    //  0408
    count,
    //  0406
    add,
    modifyBlogImgAlt,   //  0328
    cancelWithBlog,     //  0326
    
}

//  
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

const { CACHE: { TYPE: { PAGE } }} = require('../conf/constant')
const Controller_BlogImg = require('./blogImg')




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
async function _removeBlogImgAlts(blogImgAlt_list){
    let ok = await BlogImgAlt.deleteBlogImgAlts(blogImgAlt_list)
    if(!ok){
        return new ErrModel(BLOG_IMG_ALT.REMOVE_ERR)
    }
    return new SuccModel()
}

