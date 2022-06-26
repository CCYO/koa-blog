/**
 * @description API editor 相關
 */

const router = require('koa-router')()

const {
    addBlog,
    modifyBlog
} = require('../../controller/blog')
const { uploadImg } = require('../../controller/img')

const { updateBlog, removeBlog } = require('../../controller/editor')
const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/editor')

//  建立blog
router.post('/', async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { title } = ctx.request.body
    
    return ctx.body = await addBlog(title, user_id)
})

//  更新 blog 資料
router.patch('/', async(ctx, next) => {
    const { id: user_id } = ctx.session.user
    // const { removeImgs, id, html, show } = ctx.request.body
    const { id: blog_id, ...data_blog } = ctx.request.body
    return ctx.body = await modifyBlog(blog_id * 1, data_blog)
})

//  上傳圖片
router.post('/img', async (ctx, next) => {
    return ctx.body = await uploadImg(ctx)
})

router.delete('/blog', api_check_login ,async (ctx, next) => {
    const { id } = ctx.request.body
    ctx.body = await removeBlog(id)
})

module.exports = router