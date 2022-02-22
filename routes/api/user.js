/**
 * @description API user相關
 */

const router = require('koa-router')()

const { register, findUser } = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')

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
    if( !errno && ctx.session.user == null ){        
        ctx.session.user = data
    }
    ctx.body = resModel
})

router.get('/logout', api_check_login, async (ctx, next) => {
    ctx.body = 'okok'
})

module.exports = router