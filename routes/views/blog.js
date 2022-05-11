/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const {
    getBlogList,
    getBlog
} = require('../../controller/blog')

router.get('/blog-list', async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: blogs } = await getBlogList(id)
    console.log("@data.blogs => ", blogs)
    await ctx.render('blog-list', {
        blogs
    })
})


router.get('/blog/edit', view_check_login, async (ctx, next) => {
    await ctx.render('blog-edit', {
        user: ctx.session.user,
        blog: {}
    })
})

router.get('/blog/edit/:blog_id', async(ctx, next) => {
    const { blog_id } = ctx.params
    const { user } = ctx.session
    const { errno, data: blog = undefined, msg } = await getBlog(blog_id)
    if( errno ){
        return ctx.body = msg
    }else{
        return await ctx.render('blog-edit', { user, blog })
    }

})


module.exports = router