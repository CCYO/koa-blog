const Opts = require('../../utils/seq_findOpts')
const router = require('koa-router')()
const Check = require('../../middleware/check_login')
const Cache = require('../../middleware/cache')
const BlogImgAlt = require('../../controller/blogImgAlt')

router.prefix('/api/album')

router.patch('/', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { blog_id, alt, blogImgAlt_id: id } = ctx.request.body
    ctx.body = await BlogImgAlt.modifyBlogImgAlt({id, blog_id, alt})
})

module.exports = router