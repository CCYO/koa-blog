/**
 * @description Router/Views blog
 */
//  0501
const { CACHE: { TYPE, STATUS } } = require('../../conf/constant')
//  0501
const { CHECK, NEWS } = require('../../middleware/views')
//  0406
const Blog = require('../../controller/blog')
//  0504
const CACHE = require('../../middleware/cache')
//  0406
const router = require('koa-router')()                                  //  0406
//  0504
const privateCache = CACHE.private(TYPE.PAGE.BLOG)
//  0504
const commonCache = CACHE.common(TYPE.PAGE.BLOG)
//  0406
//  編輯文章
router.get('/blog/edit/:id', CHECK.login, CHECK.mustBeAuthor, privateCache, async (ctx, next) => {
    const blog_id = ctx.params.id * 1
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
    let cacheStatus = ctx.cache[TYPE.PAGE.BLOG]
    let { exist } = cacheStatus
    let cacheKey = `${TYPE.PAGE.BLOG}/${blog_id}`
    //  系統沒有緩存數據
    if (exist === STATUS.NO_CACHE) {
        //  向 DB 撈取數據
        const resModel = await Blog.findWholeInfo(blog_id)
        //  DB 沒有相符數據
        if (resModel.errno) {
            console.log(`@ DB 不存在 blog/${blog_id} 數據 `)
            return await ctx.render('page404', { ...resModel })
            //  將html數據做百分比編碼，交由前端解碼
        } else {
            console.log(`@ 從 DB 取得 ${cacheKey}`)
            //  將 DB 數據賦予給 ctx.cache
            cacheStatus.data = resModel.data
            cacheStatus.data.html = encodeURI(cacheStatus.data.html)
        }
    } else {
        console.log(`@ ${cacheKey} -> 使用系統緩存`)
    }
    return await ctx.render('blog-edit', { blog: cacheStatus.data })
})
//  0406
//  查看文章
router.get('/blog/:id', NEWS.confirm, commonCache, async (ctx, next) => {
    const blog_id = ctx.params.id * 1
    //  從 middleware 取得的緩存數據 ctx.cache[PAGE.BLOG]
    /**
     * { 
     ** exist: 提取緩存數據的結果 ,
     ** data: blogIns || undefined
     * }
     */
    let cache = ctx.cache[TYPE.PAGE.BLOG]
    let { exist } = cache
    let cacheKey = `${TYPE.PAGE.BLOG}/${blog_id}`
    if (exist === STATUS.HAS_FRESH_CACHE) {
        console.log(`@ ${cacheKey} 響應 304`)
        ctx.status = 304
    } else if (exist === STATUS.NO_IF_NONE_MATCH || exist == STATUS.IF_NONE_MATCH_IS_NO_FRESH) {
        console.log(`@ ${cacheKey} 響應 系統緩存數據`)
    } else {
        //  向 DB 提取數據
        let resModel = await Blog.findWholeInfo(blog_id)
        //  DB 沒有相符數據
        if (resModel.errno) {
            return await ctx.render('page404', resModel)
            //  將html數據做百分比編碼，交由前端解碼
        }
        console.log(`@ 從 DB 取得 ${cacheKey}`)
        //  將 DB 數據賦予給 ctx.cache
        cache.data = resModel.data
        cache.data.html = encodeURI(cache.data.html)
    }
    return await ctx.render('blog', { blog: cache.data })
})

module.exports = router