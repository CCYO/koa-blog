const router = require('koa-router')()

const { api_check_login } = require('../../middleware/check_login')
const Cache = require('../../middleware/cache')

const { modifyBlogImg } = require('../../controller/blogImg')



router.prefix('/api/album')

router.post('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    const { blog_id, name, blogImg_id } = ctx.request.body
    ctx.body = await modifyBlogImg({ blog_id, name, blogImg_id })
})

module.exports = router