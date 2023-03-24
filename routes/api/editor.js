/**
 * @description API editor 相關
 */

const { uploadImg } = require('../../middleware/blogImg')
const { addBlogImgAlt, modifiedBlogImgAlt, cutImgsWithBlog } = require('../../controller/blogImgAlt')

//  ↓0303
const router = require('koa-router')()
const Check = require('../../middleware/check_login')
const Cache = require('../../middleware/cache')
const Blog = require('../../controller/blog')
router.prefix('/api/blog')

//  建立blog    0303
router.post('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const authorId = ctx.session.user.id
    const { title } = ctx.request.body
    return ctx.body = await Blog.addBlog(title, authorId)
})
//  刪除 blogs  0303
router.delete('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const authorId = ctx.session.user.id
    const { id } = ctx.request.body
    ctx.body = await Blog.removeBlogs(id, authorId)
})
//  更新 blog 資料
router.patch('/', Check.api_logining, Cache.modifiedtCache, async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { id: blog_id, cancelImgs, ...blog_data } = ctx.request.body
    let res
    //  針對要取消關聯的圖片
    if(cancelImgs){
        res = await cutImgsWithBlog(blog_id, cancelImgs, user_id)
    }
    //  若有除了blog_id、要取消關聯的圖片 以外的數據
    if(Object.getOwnPropertyNames(blog_data).length){
        res = await Blog.modifyBlog(blog_id, blog_data, user_id)
    }
    ctx.body = res
})





//  與圖片有關 -------

//  上傳圖片
router.post('/img', Check.api_logining, Cache.modifiedtCache, uploadImg)

//  為Blog的blogImg建立另一筆blogImgAlt數據
router.post('/blogImgAlt', Check.api_logining, Cache.modifiedtCache, async(ctx, next) => {
    let { blogImg_id, blog_id } = ctx.request.body
    ctx.body = await addBlogImgAlt(blogImg_id, blog_id)
})

//  修改blogImgAlt數據
router.patch('/blogImgAlt', Check.api_logining, Cache.modifiedtCache, async(ctx, next) => {
    let { blogImgAlt_id, blog_id, alt } = ctx.request.body
    ctx.body = await modifiedBlogImgAlt(blogImgAlt_id, blog_id, alt)
})

//  初始化blog的圖片列表數據（通常用在上一次Blog有上傳圖片，但未儲存文章時，會導致沒有建立edito需要的<x-img>，因此需要初始化將其刪除）
router.patch('/initImgs', Check.api_logining, Cache.modifiedtCache, async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { id: blog_id, cancelImgs } = ctx.request.body
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    let res = await cutImgsWithBlog(blog_id, cancelImgs, user_id)
    ctx.body = res
})

module.exports = router