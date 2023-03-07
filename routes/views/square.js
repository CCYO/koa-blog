/**
 * @description Router/Views Square
 */

const router = require('koa-router')()          //  0228
const Blog = require('../../controller/blog')   //  0228

//  廣場頁  0303
router.get('/square', async (ctx, next) => {
    let exclude_id = ctx.session.user && ctx.session.user.id || null
    let { data: blogList } = await Blog.getSquareBlogList(exclude_id)
    await ctx.render('square', {
        title: '廣場頁',
        blogList
    })
})

module.exports = router