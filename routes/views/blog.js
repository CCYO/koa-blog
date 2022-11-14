/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')
const { cacheBlog } = require('../../middleware/cache')
const { confirmFollow } = require('../../middleware/confirmFollow')

const {
    getBlog
} = require('../../controller/blog')

//  撰寫新文章
router.get('/blog/new', view_check_login, cacheBlog, async (ctx, next) => {
    await ctx.render('blog-edit', {
        blog: ctx.cache.blog[1]
    })
})

//  編輯文章
router.get('/blog/edit/:blog_id', view_check_login, cacheBlog, async (ctx, next) => {
    const { blog_id } = ctx.params
    //   = { exist: BOO, kv: [K, V] }
    let { exist, kv } = ctx.cache
    if (exist === 3) {
        const resModel = await getBlog(blog_id, true)
        ctx.cache.blog = [undefined, resModel]
        console.log(`@blog/${blog_id} 完成 DB撈取`)
    } else {
        let [etag, resModel] = kv
        ctx.cache.blog = [etag, resModel]
    }

    let blog = { ...ctx.cache.blog[1].data }   //  複製一份
    console.log('@blog = > ', blog)
    if (blog.author.id != ctx.session.user.id) {
        return ctx.body = '你哪位?'
    }
    if(blog.html){
        blog.html = encodeURI(blog.html)    //  將html做百分比編碼，前端再自行解碼
    }
    return await ctx.render('blog-edit', {blog})
})

//  查看文章
router.get('/blog/:blog_id', confirmFollow, cacheBlog, async (ctx, next) => {
    const { blog_id } = ctx.params
    //   = { exist: BOO, kv: [K, V] }
    let { exist, kv } = ctx.cache
    if (exist === 3) {
        const resModel = await getBlog(blog_id, true)
        ctx.cache.blog = [undefined, resModel]
        console.log(`@ blog/${blog_id} 完成 DB撈取`)
    } else {
        let [etag, resModel] = kv
        ctx.cache.blog = [etag, resModel]
    }

    let blog = ctx.cache.blog[1].data
    console.log('@blog => ', blog)
    return await ctx.render('blog', {blog})
})

module.exports = router