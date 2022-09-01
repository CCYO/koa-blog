const { get_blog, checkNews, removeRemindNews } = require('../db/cache/redis/_redis')

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
    let page = ctx.request.body.page ? ctx.request.body.page : 0
    const { id } = ctx.session.user
    if(await checkNews(id) || !ctx.session.news[page]){
        console.log('@ => 向DB查詢')
        await next()
        return
    }
    console.log('@ => 使用session')
    ctx.body = ctx.session.news[page]
}


module.exports = {
    cacheBlog,
    cacheNews
}