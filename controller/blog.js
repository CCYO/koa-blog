const moment = require('moment')

const { 
    readBlogList,
    readBlog,
    updateFollowBlog
 } = require('../server/blog')

const { SuccModel, ErrModel } = require('../model')
const { BLOG, FOLLOW } = require('../model/errRes')

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
    getBlogList,
    getBlog,
    confirmFollowBlog
}