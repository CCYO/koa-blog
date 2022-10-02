/**
 * @description API commond相關
 */

const router = require('koa-router')()

const {
    createComment
} = require('../../controller/comment')

const { notifiedNews } = require('../../middleware/cache')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

//  創建comment
router.post('/', api_check_login, notifiedNews, async (ctx, next) => { 
    ctx.body = await createComment(ctx.request.body)
})

module.exports = router