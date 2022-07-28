/**
 * @description API commond相關
 */

const router = require('koa-router')()

const {
    createComment
} = require('../../controller/comment')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

router.post('/', api_check_login, async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { blog_id, html } = ctx.request.body
    ctx.body = await createComment(blog_id, html, user_id)
})

module.exports = router