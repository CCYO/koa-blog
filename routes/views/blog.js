/**
 * @description Router/Views blog
 */
const Blog = require('../../controller/blog')                           //  0406
//  未整理
const { CACHE: { TYPE: { PAGE }, NO_CACHE, HAS_FRESH_CACHE, NO_IF_NONE_MATCH } } = require('../../conf/constant')
const Cache = require('../../middleware/cache')                         //  未整理
const Check = require('../../middleware/check_login')                   //  0406
const router = require('koa-router')()                                  //  0406
//  0406
//  編輯文章
router.get('/blog/edit/:blog_id', Check.view_logining,
    //  未整理
    Cache.blogEditPageCache,
    async (ctx, next) => {
        const blog_id = ctx.params.blog_id * 1
        //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
        let cacheStatus = ctx.cache[PAGE.BLOG]
        let { exist } = cacheStatus
        let cacheKey = `${PAGE.BLOG}/${blog_id}`
        //  系統沒有緩存數據
        if (exist === NO_CACHE) {
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

module.exports = router


const { confirmFollow } = require('../../middleware/confirmFollow') //  未整理








//  查看文章    0228
router.get('/blog/:blog_id', confirmFollow, Cache.blogPageCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
    let cacheStatus = ctx.cache[PAGE.BLOG]
    let { exist, data: blog } = cacheStatus
    let cacheKey = `${PAGE.BLOG}/${blog_id}`
    //  提取到有效的緩存數據
    if (exist === HAS_FRESH_CACHE) {
        console.log(`@ ${cacheKey} 響應 304`)
        ctx.status = 304
        //  在沒 if-None-Match 的情況下，取得到系統緩存數據
    } else if (exist === NO_IF_NONE_MATCH) {
        console.log(`@ ${cacheKey} 響應 系統緩存整理後的數據`)
        return await ctx.render('blog', { blog })
        //  適用 NO_CACHE, IF_NO_MATCH_IS_NO_FRESH
    } else {
        //  向 DB 提取數據
        let resModel = await Blog.findWholeInfo(blog_id)
        //  將 DB 數據賦予給 ctx.cache
        cacheStatus.data = resModel.data
        //  DB 沒有相符數據
        if (resModel.errno) {
            console.log(`@ DB 不存在 blog/${blog_id} 數據 `)
            return await ctx.render('page404', { ...resModel })
            //  將html數據做百分比編碼，交由前端解碼
        }  else {
            console.log(`@ 從 DB 取得 ${cacheKey}`)
            //  將 DB 數據賦予給 ctx.cache
            cacheStatus.data = resModel.data
            cacheStatus.data.html = encodeURI(cacheStatus.data.html)
        }
    }
    return await ctx.render('blog', { blog: cacheStatus.data })
})

