/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews,

    readMore
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')
const { cacheNews } = require('../../middleware/cache')

router.prefix('/api/news')

router.get('/', api_check_login, cacheNews, async (ctx, next) => {
    const { id } = ctx.session.user
    let res = await getNewsByUserId(id)
    ctx.body = res
})

router.post('/', api_check_login, cacheNews, async ( ctx, next) => {
    ctx.body = await readMore(ctx)
})

module.exports = router