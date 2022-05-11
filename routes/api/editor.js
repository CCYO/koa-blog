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
        resModel = await updateBlog({title}, blog_id)
    }
    return ctx.body = resModel
})

// router.post('/uploadImg', )

module.exports = router