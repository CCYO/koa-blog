/**
 * @description Router/Views blog
 */

const router = require('koa-router')()
const {
    view_check_login        //  0228
} = require('../../middleware/check_login')
const {
    CACHE: {
        TYPE: {
            PAGE            //  0228
        },
        HAS_CACHE,          //  0228
        NO_IF_NONE_MATCH    //  0228
    }
} = require('../../conf/constant')
const Cache = require('../../middleware/cache') //  0228

const Comment = require('../../controller/comment') //  0228
const Blog = require('../../controller/blog')   //  0228


const { confirmFollow } = require('../../middleware/confirmFollow') //  未整理

//  編輯文章
router.get('/blog/edit/:blog_id', view_check_login, Cache.getBlogCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
    let cache = ctx.cache[PAGE.BLOG]
    let { exist, data } = cache
    let cacheKey = `${PAGE.BLOG}/${blog_id}`
    if (exist === HAS_CACHE || exist === NO_IF_NONE_MATCH) {
        console.log(`@ ${cacheKey} -> 使用系統緩存`)
        return await ctx.render('blog-edit', { blog: data })
    } else {
        const resModel = await Blog.getBlog(blog_id)
        if(resModel.errno){
            ctx.body = resModel
        }
        if (resModel.data.author.id != ctx.session.user.id) {
            console.log('@ => 非作者本人')
            return ctx.body = '你哪位?'
        }
        data = cache.data =  resModel.data
        if (data.html) {
            data.html = encodeURI(data.html)    //  將html做百分比編碼，前端再自行解碼
        }
        console.log(`@ ${cacheKey} 完成 DB撈取`)
    }
    return await ctx.render('blog-edit', { blog: data })
})

//  查看文章    0228
router.get('/blog/:blog_id', confirmFollow, Cache.getBlogCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
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
        data = cache.data =  resModel.data
        if (data.html) {
            data.html = encodeURI(data.html)    //  將html做百分比編碼，前端再自行解碼
        }
        console.log(`@ ${cacheKey} 完成 DB撈取`)
    }
    return await ctx.render('blog', { blog: data })
})

module.exports = router