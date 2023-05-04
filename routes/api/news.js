/**
 * @description API news相關
 */
const router = require('koa-router')()
const News = require('../../controller/news')
const { CHECK, CACHE } = require('../../middleware/api')
router.prefix('/api/news')
//  鑒察
router.post('/', CHECK.login, CACHE.modify, CACHE.news, async (ctx, next) => {
    let { page } = ctx.request.body
    let me = ctx.session.user
    let res
    //  該頁面初次請求
    if (page === 0) {
        //  res {errno, data: { me: 登入者資料, news: 通知數據 } } 
        res = await News.getFirstNews(me)
    } else {
        //  let { page, newsList, excepts } = ctx.request.body
        res = await News.readMore({ me, ...ctx.request.body })
    }
    ctx.body = res
})

module.exports = router