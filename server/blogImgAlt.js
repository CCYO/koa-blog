const { BlogImgAlt } = require('../db/mysql/model')

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
    let { count } = await BlogImgAlt.findAndCountAll(opts)
    return count
}
//  0326
async function createBlogImgAlt({ blogImg_id, alt }){
    let data = { blogImg_id }
    if(alt){
        data.alt = alt
    }
    let blogImgAlt = await BlogImgAlt.create(data)
    return await readBlogImgAlt({ id: blogImgAlt.dataValues.id })
}

async function updateBlogImgAlt(data, whereOps){
    let options = { where: { ...whereOps }}
    let [row] = await BlogImgAlt.update(data, options)
    if(!row){
        return false
    }
    return true
}


async function courtOfSomeImgInBlog({blog_id, blogImg_id}){
    let {} = await BlogImgAlt.findAndCountAll({
        where: { blogImg_id }
    })
}

module.exports = {
    deleteBlogImgAlts,  //  0326
    count,              //  0326
    createBlogImgAlt,   //  0326
    updateBlogImgAlt,
}
