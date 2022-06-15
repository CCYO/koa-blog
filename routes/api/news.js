/**
 * @description API news相關
 */

const router = require('koa-router')()

const { confirmNews } = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/news')

router.post('/confirm', api_check_login, async (ctx, next) => {
    const { payload } = ctx.request.body
    let res = await confirmNews(payload)
    ctx.body = res
})

module.exports = router