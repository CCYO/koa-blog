const { 
    readBlogList,
    readBlog
 } = require('../server/blog')

const { SuccModel, ErrModel } = require('../model')
const { BLOG } = require('../model/errRes')

async function getBlogList( user_id , is_self){
    let blogs = await readBlogList(user_id)
    if(!is_self){
        blogs = blogs.filter( blog => blog.show )
    }
    return new SuccModel(blogs)
}

async function getBlog( blog_id ){
    const blog = await readBlog(blog_id)
    if(blog){
        return new SuccModel(blog)
    }else{
        return new ErrModel(BLOG.NOT_EXIST)
    }
}

module.exports = {
    getBlogList,
    getBlog
}