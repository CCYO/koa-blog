const Opts = require('../utils/seq_findOpts')
const {
    //  0406
    MyErr, ErrRes, SuccModel
    , ErrModel } = require('../model')
const BlogImg = require('../server/blogImg')    //  0406
//  0429
async function findInfoForRemoveBlog(blog_id){
    let list = await BlogImg.readList(Opts.BLOG_IMG.findInfoForRemoveBlog(blog_id))
    if(list.length){
        return new ErrModel(ErrRes.BLOG_IMG.READ.NOT_EXIST)
    }
    return new SuccModel({ data: list })
}
//  0408
async function removeList(id_list) {
    let raw = await BlogImg.deleteList(Opts.FOLLOW.removeList(id_list))
    if(id_list.length !== raw){
        throw new MyErr(ErrRes.BLOG_IMG.DELETE.ROW)
    }
    return new SuccModel({ data: raw })
}
//  0406
async function add(data) {
    if(!Object.entries(data).length){
        throw MyErr(ErrRes.BLOG_IMG.CREATE.NO_DATA)
    }
    let blogImg = await BlogImg.create(data)
    return new SuccModel({ data: blogImg })
}

module.exports = {
    //  0429
    findInfoForRemoveBlog,
    //  0408
    removeList,
    //  0406
    add, 
    modifyBlogImg
}



//  0327
async function modifyBlogImg({ id, blog_id, alt }) {
    let data = [{ id, blog_id, alt }]
    let ok = await BlogImg.updateBlogImg(data)
    if (!ok) {
        return new ErrModel(UPDATE_ERR)
    }
    console.log('成功')
    return new SuccModel(null, { blog: [blog_id] })
}



