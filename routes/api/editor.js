/**
 * @description API editor 相關
 */

const router = require('koa-router')()

const { api_check_login } = require('../../middleware/check_login')
const { cache_reset } = require('../../middleware/cache')
const { uploadImg } = require('../../middleware/blogImg')

const { addBlog, removeBlog, modifyBlog } = require('../../controller/blog')
const { addBlogImgAlt, modifiedBlogImgAlt, cutImgsWithBlog } = require('../../controller/blogImgAlt')

router.prefix('/api/blog')

//  建立blog
router.post('/', api_check_login, cache_reset, async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { title } = ctx.request.body
    return ctx.body = await addBlog(title, user_id)
})

//  刪除 blog
router.delete('/', api_check_login, cache_reset, async (ctx, next) => {
    const author = ctx.session.user.id
    const { id } = ctx.request.body
    ctx.body = await removeBlog(id, author)
})

//  更新 blog 資料
router.patch('/', api_check_login, cache_reset, async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { id: blog_id, cancelImgs, ...blog_data } = ctx.request.body
    let res
    if(cancelImgs){
        res = await cutImgsWithBlog(blog_id, cancelImgs, user_id)
    }
    if(Object.getOwnPropertyNames(blog_data).length){
        res = await modifyBlog(blog_id, blog_data, user_id)
    }
    ctx.body = res
})

//  與圖片有關 -------

//  上傳圖片
router.post('/img', api_check_login, cache_reset, uploadImg)

//  為Blog的blogImg建立另一筆blogImgAlt數據
router.post('/blogImgAlt', api_check_login, cache_reset, async(ctx, next) => {
    let { blogImg_id, blog_id } = ctx.request.body
    ctx.body = await addBlogImgAlt(blogImg_id, blog_id)
})

//  修改blogImgAlt數據
router.patch('/blogImgAlt', api_check_login, cache_reset, async(ctx, next) => {
    let { blogImgAlt_id, blog_id, alt } = ctx.request.body
    ctx.body = await modifiedBlogImgAlt(blogImgAlt_id, blog_id, alt)
})

//  初始化blog的圖片列表數據（通常用在上一次Blog有上傳圖片，但未儲存文章時，會導致沒有建立edito需要的<x-img>，因此需要初始化將其刪除）
router.patch('/initImgs', api_check_login, cache_reset, async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { id: blog_id, cancelImgs } = ctx.request.body
    //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
    let res = await cutImgsWithBlog(blog_id, cancelImgs, user_id)
    ctx.body = res
})

module.exports = router