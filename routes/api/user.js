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
    ctx.body = await findUser(username, password)
})

module.exports = router