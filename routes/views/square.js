/**
 * @description Router/Views Square
 */
const { BLOG } = require('../../conf/constant')
const router = require('koa-router')()          //  0411
const Blog = require('../../controller/blog')   //  0411
//  廣場頁  0411
router.get('/square', async (ctx, next) => {
    let author_id = ctx.session.user && ctx.session.user.id || null
    let { data: blogs } = await Blog.findInfoForPageOfSquare(author_id)
    await ctx.render('square', {
        title: '廣場頁',
        blogs
    })
})
module.exports = router