/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    getMeAndTheFirstNews,
    readMore
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')
const { cacheNews, cache_reset } = require('../../middleware/cache')

router.prefix('/api/news')

router.post('/', api_check_login, cache_reset, cacheNews, async (ctx, next) => {
    
    let { page } = ctx.request.body
    let me = ctx.session.user
    let res
    if(page === 0){ //  該頁面初次請求
        //  res {errno, data: { me: 登入者資料, news: 通知數據 } } 
        res = await getMeAndTheFirstNews(me)
    }else{
        //  let { page, newsList, excepts } = ctx.request.body
        res = await readMore({me, ...ctx.request.body})
    }
    ctx.body = res
})

router.get('/tt', async (ctx) => {
    ctx.session = null
    ctx.body = 'ok'
})

module.exports = router