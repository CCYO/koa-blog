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
    const { id } = ctx.session.user
    if(await checkNews(id) || !ctx.session.news || !ctx.session.news.length){
        console.log('@ => 向DB查詢')
        await next()
    }
    console.log('@ => 使用session')
    ctx.body = ctx.session.news[0]
}


module.exports = {
    cacheBlog,
    cacheNews
}