//  0501
const S_Cache = require('../../server/cache')
//  0504
//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
async function news(ctx, next) {
    let { page, newsListNeedToConfirm: { num } } = ctx.request.body
    const { id } = ctx.session.user
    //  關於「通知」的數據，是否有變動
    let cache = await S_Cache.getNews()
    let hasNews = cache.has(id)
    //  若「通知」數據沒有變動，且有緩存
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

//  0503
async function modify(ctx, next){
    await next()
    let cache = ctx.body.cache
    //  SuccessModel.cache 無定義
    if (!cache) {
        return
    }

    await S_Cache.modify(cache)
    //  移除 SuccessModel.cache
    delete ctx.body.cache
    return
}

module.exports = {
    //  0504
    news,
    //  0504
    modify
}