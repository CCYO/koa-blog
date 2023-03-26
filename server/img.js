const { Img } = require('../db/mysql/model')

const init = require('../utils/init')

async function readImg(opts){
    let img = await Img.findOne(opts)
    return init.img(img)
}

async function createImg({url, hash}){
    let img = await Img.create({url, hash})
    return init.img(img)
}

/** 查找 img 紀錄
 * @param {object} data 查找 img 所需的 where
 */
async function readImg( whereOps , associateWithBlog = {} ) {
    let { blog_id, name } = associateWithBlog
    let where = { ...whereOps }  //  { hash, img_id, blog_id } 

    let img = await Img.findOne({where})

    let res = img

    if (img) {
        res = init_img(img)
    }

    if(!img || !blog_id){
        return res
    }

    let blogImg = await img.addBlog(blog_id, { through: { name } })
    
    let [ init_blogImg_ins ] = init_blogImg(blogImg)
    
    res.blogImg_id = init_blogImg_ins.blogImg_id
    res.name = init_blogImg_ins.name

    return res
}

/** 建立 img 紀錄
 * @param {object} data 建立 img 所需的 where
 */
async function createImg( imgData, associateWithBlog = {} ) {
    let { blog_id, name } = associateWithBlog    
    const img = await Img.create(imgData)

    let res = init_img(img)

    if (!blog_id) { // 沒有 blog_id，代表不用作關聯
        return res
    }

    let blogImg = await img.addBlog(blog_id, { through: { name }})

    let [{ blogImg_id }] = init_blogImg(blogImg)
    return  { ...res, blogImg_id, name }
}

module.exports = {
    readImg,
    createImg
}