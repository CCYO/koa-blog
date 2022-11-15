const router = require('koa-router')()

const { Model } = require('sequelize')
const { modifyBlogImg } = require('../../controller/blogImg')

router.prefix('/api/album')

router.post('/', async (ctx, next) => {
    const { name, blogImg_id } = ctx.request.body
    ctx.body = await modifyBlogImg({ name, blogImg_id })
})

module.exports = router