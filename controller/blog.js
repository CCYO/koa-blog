const moment = require('moment')
const xss = require('xss')

const { 
    createBlogAndAssociateWidthUser,
    updateBlog,
    cancelAssociateWidthImg,

    readBlog,
    updateFollowBlog
 } = require('../server/blog')

const { SuccModel, ErrModel } = require('../model')
const { BLOG, FOLLOW } = require('../model/errRes')
const { Blog, BlogImg } = require('../db/model')

/**
 * @description 建立 blog
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
 * 
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @param {*} remove_imgs 
 * @returns {object} SuccModel {data: '更新完成'} || ErrModel
 */
async function modifyBlog(blog_id, blog_data, remove_imgs) {
    let { title, removeImgs, html, show } = blog_data
    let data = {}

    if(title){
        data.title = xss(title)
    }

    if(html){
        data.html = xss(html)
    }

    if(show !== undefined){
        data.show = show
    }

    if(removeImgs && removeImgs.length){
        /* 若有值，則要刪除這些圖片的關聯 */
        let row = await cancelAssociateWidthImg(removeImgs)
        if(!row){
            return new ErrModel(BLOG.IMAGE_REMOVE_ERR)
        }
        console.log('@刪除圖片關聯成功')
    }

    console.log('@data => ', data)
    let row = await updateBlog(blog_id, data)
    
    if(!row){
        return new ErrModel(BLOG.NO_UPDATE)
    }

    return new SuccModel()

    // if(!remove_imgs){
    //     return new SuccModel()
    // }
    
    // let res = await deleteBlogImg(remove_imgs)
    // if(res){
    //     return new SuccModel()
    // }else{
    //     return new ErrModel(BLOG.IMAGE_REMOVE_ERR)
    // }
}



async function getBlogList( user_id , is_self){
    let blogs = await readBlogList(user_id)
    if(!is_self){
        blogs = blogs.filter( blog => blog.show )
    }
    return new SuccModel(blogs)
}

async function getBlog( blog_id ){
    const blog = await readBlog(blog_id)
    if(blog.show){
        blog.showAt = moment(blog.showAt, 'YYYY-MM-DD[T]hh-mm-ss').format('LLL')
    }
    if(blog){
        return new SuccModel(blog)
    }else{
        return new ErrModel(BLOG.NOT_EXIST)
    }
}

async function confirmFollowBlog(blog_id, fans_id){
    const row = await updateFollowBlog({blog_id, fans_id}, {confirm: true})
    if(row) return new SuccModel()
    return new ErrModel(FOLLOW.CONFIRM_ERR)
}

module.exports = {
    addBlog,
    modifyBlog,

    getBlogList,
    getBlog,
    confirmFollowBlog
}