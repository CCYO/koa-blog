const { get_blog, checkNews, removeRemindNews } = require('../server/cache')

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
    let hasNews = await checkNews(id)
    if (!hasNews && ctx.session.news[page]) {
        console.log(`@ => ${ctx.method} - ${ctx.path} 使用session`)
        ctx.body = ctx.session.news[page]
        return
    }
    if (hasNews || (!page && !ctx.session.news[page -1]) ) {
        ctx.session.news = []
    }
    await removeRemindNews(id)
    console.log(`@ => ${ctx.method} - ${ctx.path} 向DB查詢`)
    await next()
    return
}


module.exports = {
    cacheBlog,
    cacheNews
}