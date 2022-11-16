const router = require('koa-router')()

const { api_check_login } = require('../../middleware/check_login')
const { cache_reset } = require('../../middleware/cache')

const { modifyBlogImg } = require('../../controller/blogImg')



router.prefix('/api/album')

router.post('/', api_check_login, cache_reset, async (ctx, next) => {
    const { blog_id, name, blogImg_id } = ctx.request.body
    ctx.body = await modifyBlogImg({ blog_id, name, blogImg_id })
})

module.exports = router