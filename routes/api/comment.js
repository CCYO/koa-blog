/**
 * @description API commond相關
 */

const router = require('koa-router')()

const {
    readMoreByUserId,
    confirmNews
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

router.post('/', api_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { html } = ctx.request.body
    ctx.body = html
})

module.exports = router