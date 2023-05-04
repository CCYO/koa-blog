const BlogImgAlt = require('../../controller/blogImgAlt')
const { API } = require('../../middleware')                 //  0411
const router = require('koa-router')()                      //  0411
router.prefix('/api/album')                                 //  0411
//  0411
router.patch('/', API.CHECK.login, API.CACHE.modify, async (ctx, next) => {
    const { blog_id, alt, alt_id} = ctx.request.body
    ctx.body = await BlogImgAlt.modify({alt_id, blog_id, alt})
})
module.exports = router


const Cache = require('../../middleware/cache')
