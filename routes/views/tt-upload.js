/**
 * @description Router/Views user
 */
const router = require('koa-router')()

router.get('/view/tt-upload',
    async (ctx, next) => {
        await ctx.render('setting')
    }
)

module.exports = router