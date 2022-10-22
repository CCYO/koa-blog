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
    ctx.blog = await get_blog(blog_id, ifNoneMatch)

    if (ctx.blog.length === 1) {
        console.log(`@blog/${blog_id} 直接使用緩存304`)
        ctx.status = 304
        return
    } else if (ctx.blog.length === 2) {
        console.log(`@blog/${blog_id} 完成 CACHE撈取`)
    }else{
        console.log(`@blog/${blog_id} 無緩存，向DB撈資料`)
    }
    await next()

    if (!ctx.blog[0]) {
        //  計算etag
        ctx.blog[0] = hash_obj(ctx.blog[1])
        console.trace(`@blog/${blog_id} etag => `, ctx.blog[0])
        //  緩存
        await set_blog(blog_id, ctx.blog[0], ctx.blog[1])
        console.log(`@blog/${blog_id} 完成 DB撈取 + 緩存`)
    }
    
    ctx.set({
        etag: ctx.blog[0],
        ['Cache-Control']: 'no-cache'
    })
    
    delete ctx.blog
    return
}

async function cacheUser(ctx, next) {
    let user_id = ctx.params.id
    let ifNoneMatch = ctx.headers['if-none-match']
    ctx.cache = {}
    ctx.cache.user = await get_user(user_id, ifNoneMatch)
    let { exist, kv } = ctx.cache.user
    if (exist === 0) {
        console.log(`@user/${user_id} 直接使用緩存304`)
        ctx.status = 304
        delete ctx.cache
        return
    } 
    await next()

    if (!ctx.user[0]) {
        //  計算etag
        ctx.user[0] = hash_obj(ctx.user[1])
        console.log(`@user/${user_id} 生成 etag => `, ctx.user[0])
        //  緩存
        await set_user(user_id, ctx.user[0], ctx.user[1])
        console.log(`@user/${user_id} 完成緩存`)
    }
    
    ctx.set({
        etag: ctx.user[0],
        ['Cache-Control']: 'no-cache'
    })
    console.log(`響應新的etag => ${ctx.user[0]}`)
    
    delete ctx.user
    delete ctx.cache
    return
}

//  self頁 前端不會有緩存資料，所以在後端驗證是本人後，向系統cache查詢個人資料
async function cacheSelf(ctx, next) {
    let user_id = ctx.session.user.id
    //  向系統cache撈資料
    //  ctx.cache.user = { exist: BOO, kv: [K, V] }
    ctx.cache = {}
    ctx.cache.user = await get_user(user_id)
    
    await next()

    if (!ctx.user[0]) { //  假使緩存不存在，或是非最新版，存入緩存
        //  計算etag
        ctx.user[0] = hash_obj(ctx.user[1])
        console.log(`@ 系統緩存 user/${user_id} 生成 etag => `, ctx.user[0])
        //  緩存
        await set_user(user_id, ctx.user[0], ctx.user[1])
        console.log(`@ 系統緩存 user/${user_id} 完成緩存`)
    }
    
    ctx.set({
        ['Cache-Control']: 'no-store'
    })
    
    delete ctx.user
    delete ctx.cache
    return
}

async function resetBlog(ctx, next) {
    await next()
    let { cache } = ctx.body
    if( !cache || !cache.blog.length ){
        return
    }
    await del_blogs(cache.blog)
}

async function cacheNews(ctx, next) {
    let { body } = ctx.request
    let page = body && body.page ? body.page : 0
    let unconfirm = page ? body.excepts.unconfirm : { num: 0 }
    const { id } = ctx.session.user
    //  是否有新通知要查詢
    let hasNews = await checkNews(id)
    //  若沒有新通知，且有緩存
    if (!hasNews && ctx.session.news[page]) {
        console.trace(`@ => ${ctx.method} - ${ctx.path} 使用session取得 session.news[${page}]`)
        ctx.body = ctx.session.news[page]
        return
    }
    if (hasNews ||  // 若有新通知
        unconfirm.num ||    //  前端傳來要confirm的follow
        (page && !ctx.session.news[page - 1]) //  緩存不完全
    ) {
        console.log('@清空緩存')
        ctx.session.news = []   //  清空緩存
    }
    await removeRemindNews(id)  // 移除系統「通知有新訊息」的緩存
    console.trace(`@ => ${ctx.method} - ${ctx.path} 向DB查詢`)
    await next()

    //  next 接回來，繼續處理緩存

    if (ctx.body.errno) {   //  若發生錯誤
        return
    }
    if (!body.excepts) {    //  若這次news請求不是ReadMore
        ctx.body.data.me = ctx.session.user //  需響應me
    }
    if (ctx.session.news.length) {  //  若session未清空
        console.trace(`@存放session.news[${page}]`)
        ctx.session.news[page] = ctx.body
        return
    }
    let { excepts, ...data } = ctx.body.data
    if (excepts) {
        let { newsList: { confirm, unconfirm }, num } = data
        if (excepts.num + confirm.length + unconfirm.length === num.total) {
            console.trace(`@這輪包含confirm動作，所以保持session為空`)
            return
        }
    }
    //  存放 session.news[0]
    console.trace(`@存放session.news[0]`)
    let cache = new SuccModel({ ...data, me: ctx.session.user })    //  緩存須含me
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

async function cache_resetUser(ctx, next){
    await next()
    let { cache } = ctx.body
    if( !cache || !cache.user.length ){
        return
    }
    await del_users(cache.user)
}

async function cache_reset(ctx, next){
    await next()

    let { cache } = ctx.body
    
    if( !cache ){
        return
    }
    let { user = [], blog = [], news = [] } = cache
    if( user.length ){
        await del_users(user)
    }
    if( blog.length ){
        await del_blogs(blog)
    }
    if( news.length ){
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