/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

router.get('/test', async (ctx, next) => {
    await ctx.render('test')
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

router.get('/setting', view_check_login, async (ctx, next) => {
    await ctx.render('setting')
})

router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

module.exports = router