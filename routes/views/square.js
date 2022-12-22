/**
 * @description Router/Views Square
 */

const router = require('koa-router')()

const { view_check_login, view_check_isMe } = require('../../middleware/check_login')

const { getSquareBlogList } = require('../../controller/blog')

//  廣場頁
router.get('/square', async (ctx, next) => {
    console.log('------------------!--------------------')
    let exclude_id = ctx.session.user && ctx.session.user.id || null
    let { data: blogList } = await getSquareBlogList(exclude_id)
    console.log('@blogList => ', blogList)
    await ctx.render('square', {
        title: '廣場頁',
        blogList
    })
})

module.exports = router