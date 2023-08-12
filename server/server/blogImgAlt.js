const { ErrRes, MyErr } = require('../model')           //  0406
const Init = require('../utils/init')                   //  0406
const { BlogImgAlt } = require('../db/mysql/model')     //  0406
//  0411
async function update(id, data) {
    let [row] = await BlogImgAlt.update(data, { where: { id } })
    if (!row) {
        throw new MyErr(ErrRes.BLOG_IMG_ALT.UPDATE)
    }
    return row
}
//  0409
async function find(opts){
    let alt = await BlogImgAlt.findOne(opts)
    return Init.alt(alt)
}
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
        throw new MyErr({ ...ErrRes.BLOG_IMG_ALT.CREATE.ERR, err})
    }
    
}
module.exports = {
    //  0411
    update,
    //  0409
    find,
    //  0408
    deleteList,
    //  0408
    count, 
    //  0406
    create
}

const { Op } = require('sequelize')






async function courtOfSomeImgInBlog({ blog_id, blogImg_id }) {
    let { } = await BlogImgAlt.findAndCountAll({
        where: { blogImg_id }
    })
}


