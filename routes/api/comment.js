/**
 * @description API commond相關
 */

const router = require('koa-router')()

const {
    createComment,
    removeComment
} = require('../../controller/comment')

const { cache_reset } = require('../../middleware/cache')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

//  創建comment
router.post('/', api_check_login, cache_reset, async (ctx, next) => { 
    ctx.body = await createComment(ctx.request.body)
})

router.delete('/', api_check_login, cache_reset, async (ctx, next) => { 
    let { commentId, blog_id } = ctx.request.body
    ctx.body = await removeComment({commentId, blog_id})
})

module.exports = router