/**
 * @description API editor 相關
 */

const router = require('koa-router')()

const { addBlog } = require('../../controller/blog')

const { updateBlog, uploadImg, removeBlog } = require('../../controller/editor')
const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/editor')

//  建立blog
router.post('/', async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { title } = ctx.request.body
    
    return ctx.body = await addBlog(title, user_id)
})

router.post('/img/:img_hash/:blog_id', async (ctx, next) => {
    return ctx.body = await uploadImg(ctx)
})

//  更新 blog 資料(html || finish)
router.patch('/blog', async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { id: blog_id , html , show, remove_imgs: imgs } = ctx.request.body
    return ctx.body = await updateBlog(blog_id, {html, show, user_id}, imgs)
})

router.delete('/blog', api_check_login ,async (ctx, next) => {
    const { id } = ctx.request.body
    ctx.body = await removeBlog(id)
})

module.exports = router