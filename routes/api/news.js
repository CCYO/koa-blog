/**
 * @description API news相關
 */

const router = require('koa-router')()
const News = require('../../controller/news')
const Check = require('../../middleware/check_login')
const { CACHE } = require('../../middleware/api')

router.prefix('/api/news')
//  鑒察
router.post('/', Check.api_logining, CACHE.modify, CACHE.news,
    async (ctx, next) => {
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