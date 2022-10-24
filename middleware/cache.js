const { set_user, del_users, get_user, set_blog, del_blogs, get_blog, checkNews, removeRemindNews, remindNews } = require('../server/cache')

const { hash_obj } = require('../utils/crypto')
const { SuccModel } = require('../model')
const { CACHE: { BLOG: { EDITOR } }, } = require('../conf/constant')

const { readBlog } = require('../server/blog')

async function cacheBlog(ctx, next) {
    console.log('@EDITOR => ', EDITOR)
    console.log('@params => ', ctx.params)
    let blog_id = ctx.params.blog_id ? ctx.params.blog_id : EDITOR
    console.log('@blog_id => ', blog_id)
    let ifNoneMatch = ctx.headers['if-none-match']
    console.log('@if-none-match => ', ifNoneMatch)
    ctx.cache = {}
    ctx.cache = await get_blog(blog_id, ifNoneMatch)
    let { exist, kv } = ctx.cache
    if (exist === 0) {
        console.log(`@user/${user_id} 直接使用緩存304`)
        ctx.status = 304
        delete ctx.cache
        return
    }
    await next()

    if (!ctx.cache.blog[0]) {
        //  計算etag
        ctx.cache.blog[0] = hash_obj(ctx.cache.blog[1])
        console.log(`@blog/${blog_id} 生成 etag => `, ctx.cache.blog[0])
        //  緩存
        await set_blog(blog_id, ctx.cache.blog[0], ctx.cache.blog[1])
        console.log(`@blog/${blog_id} 完成緩存`)
    }

    ctx.set({
        etag: ctx.cache.blog[0],
        ['Cache-Control']: 'no-cache'
    })
    console.log(`響應新的etag => ${ctx.cache.blog[0]}`)
    delete ctx.cache
    return
}

async function cacheUser(ctx, next) {
    let user_id = ctx.params.id
    let ifNoneMatch = ctx.headers['if-none-match']
    ctx.cache = {}
    ctx.cache = await get_user(user_id, ifNoneMatch)
    let { exist, kv } = ctx.cache
    if (exist === 0) {
        console.log(`@user/${user_id} 直接使用緩存304`)
        ctx.status = 304
        delete ctx.cache
        return
    }
    await next()

    if (!ctx.cache.user[0]) {
        //  計算etag
        ctx.cache.user[0] = hash_obj(ctx.cache.user[1])
        console.log(`@user/${user_id} 生成 etag => `, ctx.cache.user[0])
        //  緩存
        await set_user(user_id, ctx.cache.user[0], ctx.cache.user[1])
        console.log(`@user/${user_id} 完成緩存`)
    }

    ctx.set({
        etag: ctx.cache.user[0],
        ['Cache-Control']: 'no-cache'
    })
    console.log(`響應新的etag => ${ctx.cache.user[0]}`)
    delete ctx.cache
    return
}

//  self頁 前端不會有緩存資料，所以在後端驗證是本人後，向系統cache查詢個人資料
async function cacheSelf(ctx, next) {
    let user_id = ctx.session.user.id
    //  向系統cache撈資料
    //  ctx.cache.user = { exist: BOO, kv: [K, V] }
    ctx.cache = {}
    ctx.cache = await get_user(user_id)

    await next()

    if (!ctx.cache.user[0]) { //  假使緩存不存在，或是非最新版，存入緩存
        //  計算etag
        ctx.cache.user[0] = hash_obj(ctx.cache.user[1])
        console.log(`@ 系統緩存 user/${user_id} 生成 etag => `, ctx.cache.user[0])
        //  緩存
        await set_user(user_id, ctx.cache.user[0], ctx.cache.user[1])
        console.log(`@ 系統緩存 user/${user_id} 完成緩存`)
    }

    ctx.set({
        ['Cache-Control']: 'no-store'
    })

    delete ctx.cache
    return
}

async function resetBlog(ctx, next) {
    await next()
    let { cache } = ctx.body
    if (!cache || !cache.blog.length) {
        return
    }
    await del_blogs(cache.blog)
}

async function cacheNews(ctx, next) {
    let { page, newsList } = ctx.request.body
    const { id } = ctx.session.user
    //  是否有新通知要查詢
    let hasNews = await checkNews(id)
    //  若沒有新通知，且有緩存
    if (!hasNews && ctx.session.news[page]) {
        console.log(`@ session.news[${page}] 直接使用緩存`)
        ctx.body = ctx.session.news[page]
        return
    }

    if(!ctx.session.news[page]){
        console.log(`@ session.news[${page}] 沒有緩存`)
    }

    let clearNews = false
    if (hasNews) {
        console.log(`@ 因為 user/${id} 有新通知`)
        clearNews = true
        await removeRemindNews(id)
    }
    if (newsList.num) {
        console.log(`@ 因為 請求攜帶需 confirm 的 news`)
        clearNews = true
    }
    if (page && !ctx.session.news[page - 1]) {
        console.log(`@ 因為 緩存session.news數組不完全`)
        clearNews = true
    }
    if (clearNews) {
        console.log('@清空緩存')
        page = 0
        ctx.session.news = []   //  清空緩存
    }

    // 移除系統「通知有新訊息」的緩存
    console.log(`@ 向DB查詢 news數據`)
    await next()

    //  next 接回來，繼續處理緩存

    if (ctx.body.errno) {   //  若發生錯誤
        return
    }
    console.log(`@ user/${id} 的 session.news[${page}] 完成緩存`)

    if (ctx.session.news.length) {  //  若session未清空
        ctx.session.news[page] = ctx.body
        return
    }
    let { ...data } = ctx.body.data
    
    //  存放 session.news[0]
    let cache = new SuccModel({ ...data })    //  緩存須含me
    ctx.session.news[0] = cache
}

async function notifiedNews(ctx, next) {
    await next()
    if (ctx.body.errno) {
        return
    }
    let { cache } = ctx.body
    if (cache && cache.news.length) {
        console.trace('@要被通知的人 => ', cache.news)
        await remindNews(cache.news)
        delete ctx.body.cache.news
    }
    return
}

async function cache_resetUser(ctx, next) {
    await next()
    let { cache } = ctx.body
    if (!cache || !cache.user.length) {
        return
    }
    await del_users(cache.user)
}

async function cache_reset(ctx, next) {
    await next()

    let { cache } = ctx.body

    if (!cache) {
        return
    }
    let { user = [], blog = [], news = [] } = cache
    if (user.length) {
        console.log('@ 執行 cache/user 的 reset')
        await del_users(user)
    }
    if (blog.length) {
        console.log('@ 執行 cache/blog 的 reset')
        await del_blogs(blog)
    }
    if (news.length) {
        console.log('@ 執行 cache/news 的 remind')
        await remindNews(news)
    }
    delete ctx.body.cache
}

module.exports = {
    cacheBlog,
    resetBlog,
    cacheUser,
    cacheSelf,
    cache_resetUser,
    cacheNews,
    notifiedNews,

    cache_reset
}