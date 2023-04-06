/**
 * @description API editor 相關
 */
const Blog = require('../../controller/blog')           //  0406
const Cache = require('../../middleware/cache')         //  未整理
const Check = require('../../middleware/check_login')   //  0406
const router = require('koa-router')()                  //  0406
router.prefix('/api/blog')                              //  0406

//  0406
//  建立blog
router.post('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { title } = ctx.request.body
    return ctx.body = await Blog.addBlog(title, ctx.session.user.id)
})
const { uploadImg } = require('../../middleware/blogImg')
const { addBlogImgAlt, modifiedBlogImgAlt, cutImgsWithBlog } = require('../../controller/blogImgAlt')




//  刪除 blogs  0326
router.delete('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const authorId = ctx.session.user.id
    const { id } = ctx.request.body
    ctx.body = await Blog.removeBlogs(id, authorId)
})
//  更新 blog 資料  0326
router.patch('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const author_id = ctx.session.user.id
    const { id: blog_id, ...blog_data } = ctx.request.body
    res = await Blog.modifyBlog(author_id, blog_id, blog_data)
    ctx.body = res
})
//  上傳圖片    0326
router.post('/img', Check.api_logining, Cache.modifiedtCache, uploadImg)




//  為Blog既存圖片建立alt數據
router.post('/blogImgAlt', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    let { blogImg_id, blog_id } = ctx.request.body
    ctx.body = await addBlogImgAlt({blogImg_id})
})







//  與圖片有關 -------

//  初始化blog的圖片列表數據（通常用在上一次Blog有上傳圖片，但未儲存文章時，會導致沒有建立edito需要的<x-img>，因此需要初始化將其刪除）
router.patch('/initImgs', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { id: blog_id, cancelImgs } = ctx.request.body
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    let res = await cutImgsWithBlog(blog_id, cancelImgs, user_id)
    ctx.body = res
})

module.exports = router