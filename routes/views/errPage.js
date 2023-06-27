const router = require('koa-router')()

//  0519
router.get('/errPage', async (ctx, next) => {
    let errModel = ctx.request.query
    await ctx.render('page404', { ...errModel })
})

module.exports = router