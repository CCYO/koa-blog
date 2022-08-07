const { Img } = require('../db/mysql/model')

/**
 * 查找 img 紀錄
 * @param {object} data 查找 img 所需的 where
 * @param {boolean} toJSON 是否轉為JSON格式
 * @returns {object|null} 若有找到，視toJSON而定，RV為 img Ins 或 { id, url, hash }，找不到則 null
 */
async function readImg(data, toJSON = true) {
    let img = await Img.findOne({ where: data })

    if (!img) {
        return null
    }

    if (!toJSON) {
        return img
    }

    let { id, url, hash } = img.toJSON()
    return { id, url, hash }
}

/**
 * 查找Img紀錄，並與Blog作關聯
 * @param {object} img_data 查找 img 所需的 where
 * @param {number} blog_id blog id
 * @returns {object|null} 若有找到，RV為{ blogImg_id, id, name, url, hash }，否則為
 */
async function readImgAndAssociateWidthBlog(img_data, blog_id) {
    let img = await readImg(img_data, false)

    if (!img) {
        return null
    }

    let blogImg = await img.addBlog(
        blog_id,
        { through: { name: img_data.hash } }
    )

    let { id: blogImg_id, name } = blogImg[0].toJSON()


    let { id, url, hash } = img

    if (!name) {
        name = hash
    }

    return { blogImg_id, id, name, url, hash }
}

/**
 * 建立 img 紀錄
 * @param {object} data 建立 img 所需的 where
 * @param {boolean} toJSON 是否轉為JSON格式
 * @returns {object} 視toJSON而定，RV為 img Ins 或 { id, url, hash }
 */
async function createImg(img_data, toJSON = true) {
    const img = await Img.create(img_data)

    if (!toJSON) {
        return img
    }

    let { id, url, hash } = img.toJSON()
    return { id, url, hash }
}

/**
 * 建立Img紀錄，並與Blog作關聯
 * @param {object} img_data 建立 img 所需的 where
 * @param {number} blog_id blog id
 * @returns {object} RV為{ blogImg_id, id, hash, url, name }
 */
async function createImgAndAssociateWidthBlog(img_data, blog_id) {
    const img = await createImg(img_data, false)

    if (!img_data.name) {
        img_data.name = img_data.hash
    }

    let blogImg = await img.addBlog(
        blog_id,
        { through: { name: img_data.name } }
    )

    let { id: blogImg_id, name } = blogImg[0].toJSON()

    let { id, hash, url } = img

    return { blogImg_id, id, hash, url, name }
}

module.exports = {
    readImg,
    readImgAndAssociateWidthBlog,
    createImg,
    createImgAndAssociateWidthBlog
}