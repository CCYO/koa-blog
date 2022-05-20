/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const {
    getBlogList,
    getBlog
} = require('../../controller/blog')

router.get('/blog/new', view_check_login, async (ctx, next) => {
    console.log(123)
    await ctx.render('blog-edit', {
        user: ctx.session.user,
        blog: {}
    })
})

router.get('/blog/edit/:blog_id', view_check_login, async(ctx, next) => {
    const { blog_id } = ctx.params
    const { user } = ctx.session
    const { errno, data: blog = undefined, msg } = await getBlog(blog_id)
    if( !errno && blog.user == user.id ){
        return await ctx.render('blog-edit', { user, blog })
    }else{
        return ctx.body = msg
    }
})

router.get('/blog/:blog_id', async (ctx, next) => {
    const { blog_id } = ctx.params
    const { errno, data: blog , msg } = await getBlog(blog_id)
    if( errno ){
        return ctx.body = msg
    }else{
        console.log('@blog => ', blog)
        return await ctx.render('blog', { blog })
    }
})

router.get('/blog-list', async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: blogs } = await getBlogList(id)
    await ctx.render('blog-list', {
        blogs
    })
})


module.exports = router