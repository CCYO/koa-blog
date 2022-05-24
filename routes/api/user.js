/**
 * @description API user相關
 */

const router = require('koa-router')()

const { register, findUser, modifyUserInfo, followIdol, cancelFollowIdol, logout } = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')
const { parse_user_data } = require('../../middleware/gcs')
const { validate_user_register, validate_user_update } = require('../../middleware/validate')

router.prefix('/api/user')

//  register
router.post('/register', validate_user_register, async (ctx, next) => {
    const { email, password } = ctx.request.body
    console.log('@@@email => ', email)
    console.log('@@@password => ', password)
    const res = await register(email, password)
    console.log('確認有無 ctx.session.user => ', ctx.session.user)
    ctx.body = res
})

//  login
router.post('/', async (ctx, next) => {
    const { email, password } = ctx.request.body
    console.log('確認有無 ctx.session.user => ', ctx.session.user)
    const resModel = await findUser(email, password)
    console.log('resModel.errno => ', resModel.errno)
    console.log('賦予 session 前 ctx.session.user => ', ctx.session.user)
    if( !resModel.errno && password && ctx.session.user == null ){
        console.log('準備賦予  ctx.session.user => ', ctx.session.user)
        console.log('resModel.data => ',resModel.data)
        ctx.session.user = resModel.data
    }
    console.log('賦予 session 後 ctx.session.user => ', ctx.session.user)
    ctx.body = resModel
})

router.post('/follow', async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await followIdol(fans_id, idol_id)
})

router.post('/cancelFollow', async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await cancelFollowIdol(fans_id, idol_id)
})

//  logout
router.get('/logout', api_check_login, async (ctx, next) => {
    ctx.body = logout(ctx)
})

//  setting
router.patch('/:avatar_hash', api_check_login, parse_user_data, validate_user_update ,async(ctx, next) => {
    resModel = await modifyUserInfo(ctx)
    ctx.session.user = resModel.data
    console.log('@ctx.session.user => ', ctx.session.user)
    ctx.body = resModel
})

module.exports = router