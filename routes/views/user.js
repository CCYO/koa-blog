/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

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

router.get('/setting', view_check_login, async (ctx, next) => {
    console.log('@session.user => ', ctx.session.user)
    await ctx.render('setting', {
        user: ctx.session.user
    })
})

router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

router.get('/blog-edit', view_check_login, async (ctx, next) => {
    await ctx.render('blog-edit', {
        user: ctx.session.user,
        blog: {}
    })
})

module.exports = router