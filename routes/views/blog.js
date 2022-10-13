/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')
const { cacheBlog } = require('../../middleware/cache')

const {
    getBlog
} = require('../../controller/blog')

//  撰寫新文章
router.get('/blog/new', view_check_login, cacheBlog, async (ctx, next) => {
    if (!ctx.blog.length) {
        ctx.blog[1] = { title: '撰寫新文章'}
    }

    await ctx.render('blog-edit', {
        blog: ctx.blog[1]
    })
})

//  編輯文章
router.get('/blog/edit/:blog_id', view_check_login, cacheBlog, async (ctx, next) => {
    const { blog_id } = ctx.params
    
    if (!ctx.blog.length) {
        const resModel = await getBlog(blog_id * 1)
        ctx.blog[1] = resModel.data.blog
    }
    
    if (ctx.blog[1].author.id != ctx.session.user.id) {
        return ctx.body = '你哪位?'
    }
    
    return await ctx.render('blog-edit', { blog: ctx.blog[1] })
})

//  查看文章
router.get('/blog/:blog_id', cacheBlog, async (ctx, next) => {
    if (!ctx.blog.length) {
        const { blog_id } = ctx.params
        const resModel = await getBlog(blog_id, true)
        ctx.blog[1] = resModel.data.blog  
    }

    return await ctx.render('blog', { blog: ctx.blog[1]})
})

module.exports = router