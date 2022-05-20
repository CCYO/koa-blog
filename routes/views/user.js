/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const { getBlogList } =  require('../../controller/blog')

router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

router.get('/register', async (ctx, next) => {
    await ctx.render('register&login', {
        register: true,
        login: false
    })
})

router.get('/login', async (ctx, next) => {
    await ctx.render('register&login', {
        register: false,
        login: true
    })
})

router.get('/self', view_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: blogs } = await getBlogList(id)

    await ctx.render('self', {
        user: ctx.session.user,
        blogs
    })
})

router.get('/other/:user_id', async (ctx, next) => {
    const { user_id: id } = ctx.params
    const { data: blogs } = await getBlogList(id)
    
    await ctx.render('other', {
        user: blogs.user,
        blogs
    })
})

router.get('/setting', view_check_login, async (ctx, next) => {
    console.log('@session.user => ', ctx.session.user)
    await ctx.render('setting', {
        user: ctx.session.user
    })
})

module.exports = router