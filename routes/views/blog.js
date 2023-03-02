/**
 * @description Router/Views blog
 */

const router = require('koa-router')()
const {
    CACHE: {
        TYPE: {
            PAGE    //  0228
        },
        HAS_CACHE,
        NO_IF_NONE_MATCH
    }
} = require('../../conf/constant')
const Comment = require('../../controller/comment') //  0228
const Blog = require('../../controller/blog')   //  0228
const { view_check_login } = require('../../middleware/check_login')
const Cache = require('../../middleware/cache')
const { confirmFollow } = require('../../middleware/confirmFollow')



//  查看文章    0228
router.get('/blog/:blog_id', confirmFollow, Cache.getBlogCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
    //   = { exist: BOO, kv: [K, V] }
    let cache = ctx.cache[PAGE.BLOG]
    let { exist, data } = cache
    let cacheKey = `${PAGE.BLOG}/${blog_id}`
    if (exist === HAS_CACHE) {
        console.log(`@ ${cacheKey} -> 304`)
        ctx.status = 304
    } else if(exist === NO_IF_NONE_MATCH){
        console.log(`@ ${cacheKey} -> 使用系統`)
        return await ctx.render('blog', { blog: data })
    } else {
        const resModel = await Blog.getBlog(blog_id)
        if(resModel.errno){
            ctx.body = resModel
        }
        // const commentRes = await Comment.getCommentsByBlogId(blog_id)
        data = cache.data =  resModel.data
        if (data.html) {
            data.html = encodeURI(data.html)    //  將html做百分比編碼，前端再自行解碼
        }
        console.log(`@ ${cacheKey} 完成 DB撈取`)
    }
    return await ctx.render('blog', { blog: data })
})


//  撰寫新文章
router.get('/blog/new', view_check_login, Cache.getBlogCache, async (ctx, next) => {
    await ctx.render('blog-edit', {
        blog: ctx.cache.blog[1]
    })
})

//  編輯文章
router.get('/blog/edit/:blog_id', view_check_login, Cache.getBlogCache, async (ctx, next) => {
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
    if (blog.author.id != ctx.session.user.id) {
        return ctx.body = '你哪位?'
    }
    if (blog.html) {
        blog.html = encodeURI(blog.html)    //  將html做百分比編碼，前端再自行解碼
    }
    return await ctx.render('blog-edit', { blog })
})


module.exports = router