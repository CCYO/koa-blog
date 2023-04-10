const BlogImgAlt = require('../../controller/blogImgAlt')
const Check = require('../../middleware/check_login')       //  0411
const router = require('koa-router')()                      //  0411
router.prefix('/api/album')                                 //  0411
//  0411
router.patch('/', Check.api_logining/*, Cache.modifiedtCache 未整理*/, async (ctx, next) => {
    const { blog_id, alt, alt_id} = ctx.request.body
    ctx.body = await BlogImgAlt.modify({alt_id, blog_id, alt})
})
module.exports = router


const Cache = require('../../middleware/cache')
