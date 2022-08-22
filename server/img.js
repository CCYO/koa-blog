const { Img } = require('../db/mysql/model')

const { init_img, init_blogImg } = require('../utils/init')

/** 查找 img 紀錄
 * @param {object} data 查找 img 所需的 where
 */
async function readImg({ hash, img_id, blog_id }) {

    let opts = { where: {} }

    if (img_id) {
        opts.where.id = img_id
    }

    if (hash) {
        opts.where.hash = hash
    }

    let img = await Img.findOne(opts)

    let res = null

    if (!img) {
        return res
    }

    res = init_img(img)

    if (!blog_id) { //若沒有blog_id，代表不作關聯
        return res
    }

    let blogImg = await img.addBlog(blog_id)
    let [{ id: blogImg_id, name }] = init_blogImg(blogImg)

    if(name){
        res.name = name
    }

    res.blogImg_id = blogImg_id

    return res
}

/** 建立 img 紀錄
 * @param {object} data 建立 img 所需的 where
 */
async function createImg({ hash, url, blog_id }) {

    const img = await Img.create({ hash, url })

    let res = init_img(img)

    if (!blog_id) { // 沒有 blog_id，代表不用作關聯
        return res
    }

    let blogImg = await img.addBlog(blog_id)

    let [{ id: blogImg_id, name }] = init_blogImg(blogImg)
    
    if (name) {
        res.name = name
    }
    
    res.blogImg_id = blogImg_id
    
    return res
}

module.exports = {
    readImg,
    createImg
}