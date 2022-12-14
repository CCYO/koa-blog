const {
    createBlogImgAlt,
    deleteBlogImgAlt,
    updateBlogImgAlt
} = require('../server/blogImgAlt')

const { deleteBlogImg } = require('../server/blogImg')

const { SuccModel, ErrModel } = require('../model')
const { BLOGIMGALT } = require('../model/errRes')
const { BlogImgAlt } = require('../db/mysql/model')

async function addBlogImgAlt(blogImg_id, blog_id) {
    let blogImgAlt = await createBlogImgAlt({ blogImg_id })
    return new SuccModel(blogImgAlt, { blog: [blog_id] })
}

async function modifiedBlogImgAlt(id, blog_id, alt) {
    let ok = await updateBlogImgAlt({ alt }, { id })
    if (!ok) {
        return new ErrModel(BLOGIMGALT.UPDATE_ERR)
    }
    return new SuccModel(null, { blog: [blog_id] })
}

//  依據情況，<刪除BlogImgAlt>或<刪除整筆BlogImg>
async function cutImgsWithBlog(blog_id, cancelImgs, user_id) {
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    let promiseList = cancelImgs.map(async (item) => {
        let { blogImg_id, blogImgAlt_list } = item
        //  確認在BlogImgAlt內，同樣BlogImg的條目共有幾條
        let { count } = await BlogImgAlt.findAndCountAll({ where: { blogImg_id } })
        let res
        if (count === blogImgAlt_list.length) {  //  BlogImg條目 === 要刪除的BlogImgAlt數量，代表該Blog已沒有該張圖片
            //  刪除整筆 BlogImg
            res = await deleteBlogImg({ listOfId: [blogImg_id] })
        } else {  //  BlogImg條目 !== 要刪除的BlogImgAlt數量，代表該Blog仍有同樣的圖片
            res = await deleteBlogImgAlt({ id: blogImgAlt_list })
        }
        if (!res) { //  代表刪除不完全
            throw new Error(BLOGIMGALT.REMOVE_ERR)
        }
        return true
    })
    await Promise.all(promiseList)
    return new SuccModel(null, { blog: [blog_id] })
}

module.exports = {
    addBlogImgAlt,
    modifiedBlogImgAlt,
    cutImgsWithBlog
}