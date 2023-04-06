const Init = require('../utils/init')
const {
    //  0406
    MyErr, ErrRes, SuccModel
    , ErrModel } = require('../model')
const BlogImg = require('../server/blogImg')    //  0406

//  0406
async function add(data) {
    if(!Object.entries(data).length){
        throw MyErr(ErrRes.BLOG_IMG.CREATE.NO_DATA)
    }
    let blogImg = await BlogImg.create(data)
    return new SuccModel({ data: blogImg })
}

module.exports = {
    //  0406
    add, 
    removeBlogImg,  //  0326
    
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
//  0326
async function removeBlogImg(blogImg_id) {
    let ok = await BlogImg.deleteBlogImg(blogImg_id)
    if (!ok) {
        return new ErrModel(REMOVE_ERR)
    }
    return new SuccModel()
}


