const { SESSION } = require('../../conf/constant')
//  0501
const S_Cache = require('../../server/cache')
//  0504
//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
async function news(ctx, next) {
    const { id } = ctx.session.user
    //  關於「通知」的數據，是否有變動
    let cache = await S_Cache.getNews()
    let hasNews = cache.has(id)
    let { first } = ctx.request.body
    //  若為頁面初次請求，且「通知」數據沒有變動，並有緩存數據
    if (first && !hasNews && ctx.session.news.errno === 0 ) {
        console.log(`@ user/${id} 直接使用緩存 session.news`)
        ctx.body = ctx.session.news
        return
    }
    //  若有新通知
    if (hasNews) {
        console.log(`@ 因為 user/${id} 的通知數據有變動`)
        //  從系統緩存cacheNews中移除當前userId
        await cache.delList([id])
        ctx.session.news = SESSION.NEWS(ctx)
    }
    // 移除系統「通知有新訊息」的緩存
    console.log(`@ user/${id} 向DB查詢 news數據`)
    await next()

    let {
        errno,
        data: {
            news: { newsList: { unconfirm, confirm },
                num /* unconfirm, confirm, total */
            } }
    } = ctx.body
    //  ctx.session.news 與 ctx.body 同格式
    let cacheNews = ctx.session.news.data.news
    //  更新 unconfirm, confirm, num, errno
    cacheNews.newsList.unconfirm = [...unconfirm, ...cacheNews.newsList.unconfirm]
    cacheNews.newsList.confirm = [...confirm, ...cacheNews.newsList.confirm]
    cacheNews.num = num
    ctx.session.news.errno = errno
    console.log(`@ user/${id} 的 session.news 完成緩存`)
}
//  0503
//  當 cache 有變動時
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