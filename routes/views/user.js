/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const api_check_login = require('../../middleware/check_login')

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

router.get('/square', api_check_login, async (ctx, next) => {
    ctx.body = 'okok'
})

module.exports = router