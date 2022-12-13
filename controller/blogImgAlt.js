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

async function deleteImgs(blog_id, cancelImgs, user_id) {
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    let promiseList = cancelImgs.map(async (item) => {
        let { blogImg_id, blogImgAlt_list } = item
        let { count } = await BlogImgAlt.findAndCountAll({ where: { blogImg_id } })
        let res
        if (count === blogImgAlt_list.length) {  //  若要刪除的alt數量與資料夾存放的blogImgAlt數量相同
            res = await deleteBlogImg({ listOfId: [blogImg_id] })
        } else {  //  若要刪除的alt數量與資料夾存放的blogImgAlt數量相同
            res = await deleteBlogImgAlt({ id: blogImgAlt_list })
        }
        if (!res) {
            throw new Error(`${blogImg_id} 初始化失敗`)
        }
        return true
    })
    try{
        await Promise.all(promiseList)
        return new SuccModel(null, { blog: [blog_id]})
    }catch(err){
        throw err
    }
}

module.exports = {
    addBlogImgAlt,
    modifiedBlogImgAlt,
    deleteImgs
}