/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    readMore,
    confirmNews
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/news')

router.post('/readMore', api_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { lastTime } = ctx.request.body
    await readMore(id, lastTime)
    ctx.body = lastTime
})

router.post('/confirm', api_check_login, async (ctx, next) => {
    const { payload } = ctx.request.body
    let res = await confirmNews(payload)
    ctx.body = res
})

module.exports = router