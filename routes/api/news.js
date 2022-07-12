/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    readMoreByUserId,
    confirmNews
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/news')

router.post('/readMore', api_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { markTime, offset } = ctx.request.body
    
    let res = await readMoreByUserId(id, markTime, offset)
    console.log('@api res => ', res)
    ctx.body = res
})

router.post('/confirm', api_check_login, async (ctx, next) => {
    const { payload } = ctx.request.body
    let res = await confirmNews(payload)
    ctx.body = res
})

module.exports = router