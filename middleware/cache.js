const {
    CACHE: {
        BLOG_EDIT_PAGE,
        TYPE: {
            API,
            PAGE            //  0228
        },
        HAS_CACHE,          //  0228
        NO_IF_NONE_MATCH,    //  0228
        IF_NONE_MATCH_IS_NO_FRESH,
        NO_CACHE
    },
} = require('../conf/constant')

const Cache = require('../server/cache')    //  0228

const {
    checkNews, removeRemindNews,
} = require('../server/cache')

//  0228
async function getCommentCache(ctx, next) {
    let blog_id = ctx.params.blog_id ? ctx.params.blog_id : EDITOR
    let ifNoneMatch = ctx.headers['if-none-match']
    ctx.cache = {}
    //  向系統cache撈資料
    let cache = await Cache.getComment(blog_id, ifNoneMatch)
    ctx.cache = {
        [API.COMMENT]: cache
    }

    await next()

    if (cache.exist !== HAS_CACHE && cache.exist !== NO_IF_NONE_MATCH) { //  沒有有效緩存
        //  緩存
        const etag = await Cache.setComment(blog_id, ctx.cache[API.COMMENT].data)
        if (etag) {
            console.log('前端設置etag')
            ctx.set({
                etag,
                ['Cache-Control']: 'no-cache'
            })
        }
    }
    delete ctx.cache
    return
}

async function blogEditPageCache(ctx, next) {
    let blog_id = ctx.params.blog_id
    // let ifNoneMatch = ctx.headers['if-none-match']
    ctx.cache = {}
    //  向系統cache撈資料
    let cache = await Cache.getBlog(blog_id)
    ctx.cache = {
        [PAGE.BLOG]: cache
    }
    await next()

    let { exist, data } = cache
    
    if ( data || exist !== HAS_CACHE ){
        let etag
        if (exist === IF_NONE_MATCH_IS_NO_FRESH) {
            etag = ifNoneMatch
        } else if (exist === NO_CACHE || exist === IF_NONE_MATCH_IS_NO_FRESH) { //  沒有有效緩存
            //  緩存
            etag = await Cache.setBlog(blog_id, ctx.cache[PAGE.BLOG].data)
            if (etag) {
                ctx.set({
                    etag,
                    ['Cache-Control']: 'no-cache'
                })
                console.log(`${PAGE.BLOG}/${blog_id} 設置 etag`)
            }
        }
        ctx.set({
            etag,
            ['Cache-Control']: 'no-cache'
        })
    }
    delete ctx.cache
    return
}

//  0228
async function blogPageCache(ctx, next) {
    let blog_id = ctx.params.blog_id
    let ifNoneMatch = ctx.headers['if-none-match']
    ctx.cache = {}
    //  向系統cache撈資料
    let cache = await Cache.getBlog(blog_id, ifNoneMatch)
    ctx.cache = {
        [PAGE.BLOG]: cache
    }
    await next()

    let { exist, data } = cache
    
    if ( data || exist !== HAS_CACHE ){
        let etag
        if (exist === IF_NONE_MATCH_IS_NO_FRESH) {
            etag = ifNoneMatch
        } else if (exist === NO_CACHE || exist === IF_NONE_MATCH_IS_NO_FRESH) { //  沒有有效緩存
            //  緩存
            etag = await Cache.setBlog(blog_id, ctx.cache[PAGE.BLOG].data)
            if (etag) {
                ctx.set({
                    etag,
                    ['Cache-Control']: 'no-cache'
                })
                console.log(`${PAGE.BLOG}/${blog_id} 設置 etag`)
            }
        }
        ctx.set({
            etag,
            ['Cache-Control']: 'no-cache'
        })
    }
    delete ctx.cache
    return
}

//  0228
async function getBlogCache(ctx, next) {
    let blog_id = ctx.params.blog_id
    let ifNoneMatch = ctx.headers['if-none-match']
    ctx.cache = {}
    //  向系統cache撈資料
    let cache = await Cache.getBlog(blog_id, ifNoneMatch)
    ctx.cache = {
        [PAGE.BLOG]: cache
    }

    await next()

    if (cache.exist !== HAS_CACHE || cache.exist === IF_NONE_MATCH_IS_NO_FRESH) { //  沒有有效緩存
        //  緩存
        const etag = await Cache.setBlog(blog_id, ctx.cache[PAGE.BLOG].data)
        if (etag) {
            let path = ctx.path
            let regux = /\/blog\/edit\//
            let isEditPage = regux.test(path)
            if (isEditPage) {
                ctx.set({ ['Cache-Control']: 'no-store' })
            } else {
                ctx.set({
                    etag,
                    ['Cache-Control']: 'no-cache'
                })
            }
        }
    }
    delete ctx.cache
    return
}

//  更新的cache數據 0228
async function modifiedtCache(ctx, next) {
    await next()

    //  SuccessModel.cache 無定義
    if (!ctx.body.cache) {
        return
    }

    await Cache.modifyCache(ctx.body.cache)
    //  移除 SuccessModel.cache
    delete ctx.body.cache
    return
}

//  0228
async function getOtherCache(ctx, next) {
    let user_id = ctx.params.id * 1
    let ifNoneMatch = ctx.headers['if-none-match']

    //  向系統cache撈資料
    let cache = await Cache.getUser(user_id, ifNoneMatch)
    ctx.cache = {
        [PAGE.USER]: cache
    }
    if (cache.exist === NO_IF_NONE_MATCH) {
        console.log(`${[PAGE.USER]}/${user_id} 直接使用緩存`)
    }
    await next()

    if (cache.exist !== HAS_CACHE && cache.exist !== NO_IF_NONE_MATCH) { //  沒有有效緩存
        //  緩存
        const etag = await Cache.setUser(user_id, ctx.cache[PAGE.USER].data)
        if (etag) {
            console.log('前端設置etag')
            ctx.set({
                etag,
                ['Cache-Control']: 'no-cache'
            })
        }
    }
    delete ctx.cache
    return
}

//  self頁 前端不會有緩存資料，所以在後端驗證是本人後，向系統cache查詢個人資料  0228
async function getSelfCache(ctx, next) {
    let user_id = ctx.session.user.id
    //  向系統cache撈資料
    let { exist, data } = await Cache.getUser(user_id)
    ctx.cache = {
        [PAGE.USER]: {
            exist, data
        }
    }
    await next()

    if (exist !== HAS_CACHE) { //  沒有有效緩存
        //  緩存
        await Cache.setUser(user_id, ctx.cache[PAGE.USER].data)
    }

    ctx.set({
        ['Cache-Control']: 'no-store'
    })

    delete ctx.cache

    return
}

async function cachePublic(ctx, next) {
    let path = ctx.path
}





async function resetBlog(ctx, next) {
    await next()
    let { cache } = ctx.body
    if (!cache || !cache.blog.length) {
        return
    }
    await del_blogs(cache.blog)
}

//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
async function cacheNews(ctx, next) {
    let { page, newsListNeedToConfirm: { num } } = ctx.request.body
    const { id } = ctx.session.user
    //  是否有新通知要查詢
    let hasNews = await checkNews(id)
    //  若沒有新通知，且有緩存
    if (!hasNews && ctx.session.news[page]) {
        console.log(`@ user/${id} 直接使用緩存 session.news[${page}]`)
        ctx.body = ctx.session.news[page]
        return
    }
    //  若沒有緩存
    if (!ctx.session.news[page]) {
        console.log(`@ 因為 user/${id} 的 session.news[${page}] 沒有緩存`)
    }
    //  標記，是否清空session.news
    let clearNews = false
    //  若有新通知
    if (hasNews) {
        console.log(`@ 因為 user/${id} 有新通知`)
        clearNews = true
        //  從系統緩存cacheNews中移除當前userId
        await removeRemindNews(id)
    }
    //  請求若有攜帶需確認的通知
    if (num) {
        console.log(`@ 因為 請求攜帶需 confirm 的 news`)
        clearNews = true
    }
    //  請求不是第一頁 && 緩存數據不連續
    if (page && !ctx.session.news[page - 1]) {
        console.log(`@ 因為 緩存session.news數組不完全`)
        clearNews = true
    }
    //  clearNews標記若為true
    if (clearNews) {
        console.log(`@ 清空 user/${id} 的 session.news`)
        //  重製page，在下方向BD取得數據，next回來後做緩存時，將會用到
        page = 0
        ctx.session.news = []   //  清空緩存
    }

    // 移除系統「通知有新訊息」的緩存
    console.log(`@ user/${id} 向DB查詢 news數據`)
    await next()

    //  next 接回來，繼續處理緩存
    if (ctx.body.errno) {   //  若發生錯誤
        return
    }
    //  ctx.body = { errno, data, cache }
    let { errno, data } = ctx.body
    ctx.session.news[page] = { errno, data }
    console.log(`@ user/${id} 的 session.news[${page}] 完成緩存`)
    // console.log(`@session.news[${page}] => `, ctx.session.news[page])
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





module.exports = {
    resetBlog,

    cacheNews,
    notifiedNews,
    cachePublic,

    blogEditPageCache,  //  0303
    blogPageCache,  //  0228
    getCommentCache,//  0228
    getBlogCache,   //  0228
    modifiedtCache, //  0228
    getOtherCache,  //  0228
    getSelfCache    //  0228
}