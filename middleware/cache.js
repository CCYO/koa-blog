const {
    CACHE: {
        TYPE: {
            API,
            PAGE            //  0228
        },
        HAS_FRESH_CACHE,          //  0228
        NO_IF_NONE_MATCH,    //  0228
        IF_NONE_MATCH_IS_NO_FRESH,
        NO_CACHE
    },
} = require('../conf/constant')

const S_Cache = require('../server/cache')


//  0303
async function blogEditPageCache(ctx, next) {
    let blog_id = ctx.params.blog_id * 1
    ctx.cache = {}
    //  向系統緩存撈資料 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
    let cacheStatus = await S_Cache.getBlog(blog_id)
    ctx.cache = {
        [PAGE.BLOG]: cacheStatus
    }
    await next()
    let { exist, data } = ctx.cache[PAGE.BLOG]
    //  系統沒有應對的緩存資料
    if (exist === NO_CACHE) {
        //  將blog存入系統緩存
        await S_Cache.setBlog(blog_id, data)
    }
    //  不允許前端緩存
    ctx.set({
        ['Cache-Control']: 'no-store'
    })
    console.log(`不允許前端緩存 ${ctx.request.path} 響應的數據`)
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

    await S_Cache.modifyCache(ctx.body.cache)
    //  移除 SuccessModel.cache
    delete ctx.body.cache
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

//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
async function cacheNews(ctx, next) {
    let { page, newsListNeedToConfirm: { num } } = ctx.request.body
    const { id } = ctx.session.user
    //  是否有新通知要查詢
    let hasNews = await S_Cache.checkNews(id)
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
        await S_Cache.removeRemindNews(id)
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
    blogEditPageCache,  //  0303
    modifiedtCache,     //  0228
    resetBlog,
    cacheNews,
    notifiedNews,
}