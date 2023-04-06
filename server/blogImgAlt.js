const { ErrRes, MyErr } = require('../model')           //  0406
const Init = require('../utils/init')                   //  0406
const { BlogImgAlt } = require('../db/mysql/model')     //  0406
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
    //  0406
    create,
    updateBlogImgAlts,  //  0328
    deleteBlogImgAlts,  //  0326
    count,              //  0326
    
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
//  0326
async function deleteBlogImgAlts(ids) {
    let row = await BlogImgAlt.destroy({
        where: { id: { [Op.in]: ids } }
    })
    if (ids.length !== row) {
        return false
    }
    return true
}
//  0326
async function count(opt) {
    let { count } = await BlogImgAlt.findAndCountAll(opt)
    return count
}



async function courtOfSomeImgInBlog({ blog_id, blogImg_id }) {
    let { } = await BlogImgAlt.findAndCountAll({
        where: { blogImg_id }
    })
}


