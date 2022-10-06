/**
 * @description API editor 相關
 */

const router = require('koa-router')()

const { addBlog, modifyBlog, removeBlog } = require('../../controller/blog')

const { uploadImg } = require('../../controller/img')

const { api_check_login } = require('../../middleware/check_login')
const { notifiedNews, resetBlog } = require('../../middleware/cache')

router.prefix('/api/blog')

//  建立blog
router.post('/', api_check_login, async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { title } = ctx.request.body
    return ctx.body = await addBlog(title, user_id)
})

//  上傳圖片
router.post('/img', api_check_login, resetBlog, uploadImg, async (ctx, next) => {
    return ctx.body = await uploadImg(ctx)
})

//  刪除 blog
router.delete('/', api_check_login, notifiedNews, async (ctx, next) => {
    const { id } = ctx.request.body
    ctx.body = await removeBlog(id)
})

//  更新 blog 資料
router.patch('/', api_check_login, notifiedNews, resetBlog, async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    // const { removeImgs, id, html, show } = ctx.request.body
    const { id: blog_id, ...blog_data } = ctx.request.body
    ctx.body  = await modifyBlog(blog_id, blog_data, user_id)
})

module.exports = router