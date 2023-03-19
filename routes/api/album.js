const router = require('koa-router')()

const Check = require('../../middleware/check_login')
const Cache = require('../../middleware/cache')

const { modifyBlogImg } = require('../../controller/blogImg')



router.prefix('/api/album')

router.post('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { blog_id, name, blogImg_id } = ctx.request.body
    ctx.body = await modifyBlogImg({ blog_id, name, blogImg_id })
})

module.exports = router