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
async function createImg( imgData, associateWithBlog = 0) {

    //  imgData { hash, url }
    console.log('@ => ', imgData)
    const img = await Img.create(imgData)

    let res = init_img(img)

    if (!associateWithBlog) { // 沒有 blog_id，代表不用作關聯
        return res
    }

    let blogImg = await img.addBlog(associateWithBlog)

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