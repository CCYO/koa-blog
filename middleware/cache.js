const { get_blog, get_cacheNews } = require('../db/cache/redis/_redis')

async function cacheBlog(ctx, next) {
    const { blog_id } = ctx.params
    let hash = ctx.headers['if-none-match']
    if (hash && await get_blog(blog_id, hash)) {
        console.log('@使用緩存')
        ctx.status = 304
        return
    }
    await next()
}

async function cacheNews(ctx, next) {
    const hash = ctx.headers['if-none-match']
    console.log('@hash => ', hash)
    const { id } = ctx.session.user
    let { page } = ctx.request.body
    if(hash){
        let news = await get_cacheNews(id)
        console.log('@news => ', news)
        if(news.etag === hash && news.page !== null && page <= news.page){
            console.log('@使用緩存')
            ctx.status = 304
            return
        }
    }
    await next()
}


module.exports = {
    cacheBlog,
    cacheNews
}