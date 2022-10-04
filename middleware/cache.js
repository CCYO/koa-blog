const { set_blogAPI, set_blogVIEW, get_blogVIEW, checkNews, removeRemindNews, remindNews } = require('../server/cache')

const { hash_obj } = require('../utils/crypto')
const { SuccModel } = require('../model')

async function cacheBlog(ctx, next) {
    const { blog_id } = ctx.params
    let hash = ctx.headers['if-none-match']
    console.log('hash => ', hash)
    if (hash) {
        let cache = await get_blogVIEW(blog_id, hash)
        if (cache === true) {
            console.log('@BLOG直接使用緩存304')
            ctx.status = 304
            return
        } else if (Array.isArray(cache)) {
            ctx.blog = cache
            console.log(`@BLOG 從cache撈取 -> blog/${blog_id}: [ ${etag} : BLOG數據 ]`)
            ctx.set({
                etag,
                ['Cache-Control']: 'no-cache'
            })
        }
    }
    // if (hash && await get_blog(blog_id, hash)) {
    //     console.log('@BLOG 使用緩存')
    //     ctx.status = 304
    //     return
    // }
    await next()

    let { api, view } = ctx.blog
    let etag
    if (!api[0]) {
        let blogData = api[1]
        //  計算etag
        etag = hash_obj(blogData)
        console.trace('@blogAPI etag => ', etag)
        //  緩存
        await set_blogAPI(blog_id, etag, blogData)
        console.log(`@BLOG API 從DB撈取 + 存入緩存 session -> API:blog/${blog_id}: [ ${etag} : BLOG數據 ]`)
    }

    if(view){
        etag = hash_obj(blogData)
        console.trace('@blogVIEW etag => ', etag)
        await set_blogVIEW(blog_id, etag, view)
        console.log(`@BLOG 從DB撈取 + 存入緩存 session -> VIEW:blog/${blog_id}: [ ${etag} : BLOG VIEW ]`)
    }

    ctx.set({
        etag,
        ['Cache-Control']: 'no-cache'
    })

    delete ctx.blog
    return
}

async function resetBlog(ctx, next) {
    await next()
    let { blog } = ctx.body.data
    let etag = hash_obj(blog)

    await set_blog(blog.id, etag, blog)
    console.log(`@reset blog cache ${etag}`)
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
    let { notifiedIdList, ...otherData } = ctx.body.data
    if (notifiedIdList && notifiedIdList.length) {
        console.trace('@要被通知的人 => ', notifiedIdList)
        await remindNews(notifiedIdList)
    }

    ctx.body.data = { ...otherData }
    return
}


module.exports = {
    cacheBlog,
    cacheNews,
    resetBlog,
    notifiedNews
}