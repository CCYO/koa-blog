const moment = require('moment')
const xss = require('xss')

const { 
    createBlog,

    readBlogList,
    readBlog,
    updateFollowBlog
 } = require('../server/blog')

const { SuccModel, ErrModel } = require('../model')
const { BLOG, FOLLOW } = require('../model/errRes')

/**
 * @description 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id: blog.id }} || ErrModel
 */
 async function addBlog(title, userId) {
    try {
        title = xss(title)
        const blog = await createBlog(title, userId)
        return new SuccModel({ id: blog.id })
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
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

    getBlogList,
    getBlog,
    confirmFollowBlog
}