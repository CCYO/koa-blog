/**
 * @description API commond相關
 */

const router = require('koa-router')()

const {
    createComment
} = require('../../controller/comment')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

//  創建comment
router.post('/', api_check_login, async (ctx, next) => {
    const { id: user_id } = ctx.session.user
    const { blog_id, comment } = ctx.request.body
    ctx.body = await createComment(blog_id, comment, user_id)
})

module.exports = router