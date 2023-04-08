const { ErrRes, MyErr } = require('../model')           //  0406
const Init = require('../utils/init')                   //  0406
const { BlogImgAlt } = require('../db/mysql/model')     //  0406
//  0408
async function deleteList(opts) {
    try {
        let row = await BlogImgAlt.destroy(opts)
        return row
    }catch(err){
        throw new MyErr({ ...ErrRes.BLOG_IMG_ALT.DELETE.ERR, err })
    }
}
//  0408
async function count(opt) {
    return await BlogImgAlt.count(opt)
}
//  0406
async function create(data) {
    try {
        let blogImgAlt = await BlogImgAlt.create(data)
        return Init.blogImgAlt(blogImgAlt)
    }catch(err){
        throw MyErr({ ...ErrRes.BLOG_IMG_ALT.CREATE.ERR, err})
    }
    
}
module.exports = {
    //  0408
    deleteList,
    //  0408
    count, 
    //  0406
    create,
    updateBlogImgAlts,  //  0328
}

const { Op } = require('sequelize')




async function updateBlogImgAlts(data, opts) {
    console.log(data, opts)
    let [row] = await BlogImgAlt.update(data, opts)
    if (!row) {
        return false
    }
    return true
}

async function courtOfSomeImgInBlog({ blog_id, blogImg_id }) {
    let { } = await BlogImgAlt.findAndCountAll({
        where: { blogImg_id }
    })
}


