/**
 * @description API editor 相關
 */

const router = require('koa-router')()

const { addBlog, updateBlog, uploadImg } = require('../../controller/editor')
const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/editor')

//  建立blog
router.post('/blog', async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { title, id: blog_id } = ctx.request.body
    //  響應 blog.id
    let resModel
    if(!blog_id){
        resModel = await addBlog(title, user_id)
    }else{
        resModel = await updateBlog(blog_id, {title})
    }
    return ctx.body = resModel
})

router.post('/img/:img_hash/:blog_id', async (ctx, next) => {
    return ctx.body = await uploadImg(ctx)
})

//  更新 blog html 資料
router.patch('/blog/', async(ctx, next) => {
    const { id, html , remove_imgs: imgs } = ctx.request.body
    return ctx.body = await updateBlog(id, {html}, imgs)
})

module.exports = router