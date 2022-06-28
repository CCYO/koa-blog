const moment = require('moment')
const xss = require('xss')

const { 
    createBlogAndAssociateWidthUser,
    updateBlog,
    cancelAssociateWidthImg,
    readBlogById,

    updateFollowBlog
 } = require('../server/blog')

const { SuccModel, ErrModel } = require('../model')
const { BLOG, FOLLOW } = require('../model/errRes')

/**
 * 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
 async function addBlog(title, userId) {
    try {
        title = xss(title)
        const blog = await createBlogAndAssociateWidthUser(title, userId)
        return new SuccModel(blog)
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}

/**
 * 更新 blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modifyBlog(blog_id, blog_data) {
    let { title, removeImgs, html, show, showAt } = blog_data
    let data = {}

    if(title){
        data.title = xss(title)
    }

    if(html){
        data.html = xss(html)
        console.log('@xss html => ', data.html)
    }

    if(show !== undefined){
        data.show = show

        //  第一次公開
        if(show && !data.showAt){
            //  建立 showAt
        }
        //  公開過又隱藏
        if(!show && data.showAt){

        }

        //  不是第一次公開
        if(show && data.showAt){

        }

    }

    if(removeImgs && removeImgs.length){
        /* 若有值，則要刪除這些圖片的關聯 */
        let row = await cancelAssociateWidthImg(removeImgs)
        if(!row){
            return new ErrModel(BLOG.IMAGE_REMOVE_ERR)
        }
    }

    let row = await updateBlog(blog_id, data)
    
    if(!row){
        return new ErrModel(BLOG.NO_UPDATE)
    }

    return new SuccModel()
}

/**
 * 刪除 blog
 * @param {number} blog_id 
 * @returns {object} SuccModel || ErrModel
 */
async function removeBlog(blog_id){
    const res = await deleteBlog(blog_id)
    if(res) return new SuccModel()
    return new ErrModel(BLOG.BLOG_REMOVE_ERR)
}

/**
 * 取得 blog 紀錄
 * @param {number} blog_id blog id
 * @returns 
 */
async function getBlog( blog_id ){
    const blog = await readBlogById(blog_id)
    // if(blog.show){
    //     blog.showAt = moment(blog.showAt, 'YYYY-MM-DD[T]hh-mm-ss').format('LLL')
    // }
    if(blog){
        return new SuccModel(blog)
    }else{
        return new ErrModel(BLOG.NOT_EXIST)
    }
}


async function getBlogList( user_id , is_self){
    let blogs = await readBlogList(user_id)
    if(!is_self){
        blogs = blogs.filter( blog => blog.show )
    }
    return new SuccModel(blogs)
}



async function confirmFollowBlog(blog_id, fans_id){
    const row = await updateFollowBlog({blog_id, fans_id}, {confirm: true})
    if(row) return new SuccModel()
    return new ErrModel(FOLLOW.CONFIRM_ERR)
}

module.exports = {
    addBlog,
    modifyBlog,
    removeBlog,
    getBlog,

    getBlogList,
    confirmFollowBlog
}