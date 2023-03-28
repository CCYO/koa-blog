const { Op } = require('sequelize')
const Init = require('../utils/init')
const { BlogImgAlt } = require('../db/mysql/model')

async function updateBlogImgAlts(data, opts){
    console.log(data, opts)
    let [row] = await BlogImgAlt.update(data, opts)
    if(!row){
        return false
    }
    return true
}
//  0326
async function deleteBlogImgAlts(ids){
    let row = await BlogImgAlt.destroy({
        where: { id: { [Op.in]: ids }}
    })
    if(ids.length !== row){
        return false
    }
    return true
}
//  0326
async function count(opt){
    let { count } = await BlogImgAlt.findAndCountAll(opt)
    return count
}
//  0326
async function createBlogImgAlt({ blogImg_id, alt }){
    let data = { blogImg_id }
    if(alt){
        data.alt = alt
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    if(!blogImgAlt){
        return false
    }
    return Init.blogImgAlt(blogImgAlt)
}


async function courtOfSomeImgInBlog({blog_id, blogImg_id}){
    let {} = await BlogImgAlt.findAndCountAll({
        where: { blogImg_id }
    })
}

module.exports = {
    updateBlogImgAlts,  //  0328
    deleteBlogImgAlts,  //  0326
    count,              //  0326
    createBlogImgAlt,   //  0326
}
