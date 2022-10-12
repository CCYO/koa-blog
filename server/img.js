const { Img } = require('../db/mysql/model')

const { init_img, init_blogImg } = require('../utils/init')

/** 查找 img 紀錄
 * @param {object} data 查找 img 所需的 where
 */
async function readImg( whereOps , associateWithBlog = 0) {
    
    let where = { ...whereOps }  //  { hash, img_id, blog_id } 

    let img = await Img.findOne({where})

    let res = img

    if (img) {
        res = init_img(img)
    }

    if(!img || !associateWithBlog){
        return res
    }

    let blogImg = await img.addBlog(associateWithBlog)
    let blogImgAlt = await blogImg.createBlogImgAlt({})
    let [{ id: blogImg_id }] = init_blogImg(blogImg)

    res.blogImg_id = blogImg_id
    res.blogImgAlt_id = blogImgAlt.id

    return res
}

/** 建立 img 紀錄
 * @param {object} data 建立 img 所需的 where
 */
async function createImg( imgData, associateWithBlog = 0) {

    //  imgData { hash, url }
    console.log('@ => ', imgData)
    const img = await Img.create(imgData)

    let res = init_img(img)

    if (!associateWithBlog) { // 沒有 blog_id，代表不用作關聯
        return res
    }

    let blogImg = await img.addBlog(associateWithBlog)
    let { dataValues: { id: blogImgAlt_id, alt }} = await blogImg[0].createBlogImgAlt({})

    let [{ id: blogImg_id }] = init_blogImg(blogImg)
    
    res.blogImg_id = blogImg_id
    res.blogImgAlt_id = blogImgAlt_id
    res.alt = alt ? alt : blogImgAlt_id
    return res
}

module.exports = {
    readImg,
    createImg
}