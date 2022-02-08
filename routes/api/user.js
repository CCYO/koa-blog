/**
 * @description API user相關
 */

const router = require('koa-router')()

const { register, findUser } = require('../../controller/user')

router.prefix('/api/user')

//  register
router.post('/register', async (ctx, next) => {
    const { username, password } = ctx.request.body
    ctx.body = await register(username, password)
})

//  login
router.post('/', async (ctx, next) => {
    const { username, password } = ctx.request.body
    const resModel = await findUser(username, password)
    const {
        errno,
        data = undefined,
    } = resModel
    if( !errno && !ctx.session.user ){
        console.log(`@@ ctx.session ===> ${ctx.session}`)
        ctx.session.user = data
        console.log(`@@ ctx.session.user ===> ${ctx.session}`)
    }
    ctx.body = resModel
})

module.exports = router