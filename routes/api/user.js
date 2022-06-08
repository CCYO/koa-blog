/**
 * @description API user相關
 */

const router = require('koa-router')()

const { register, findUser, modifyUserInfo, followIdol, cancelFollowIdol, logout, getNews } = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')
const { parse_user_data } = require('../../middleware/gcs')
const { validate_user_register, validate_user_update } = require('../../middleware/validate')

router.prefix('/api/user')

//  register
router.post('/register', validate_user_register, async (ctx, next) => {
    const { email, password } = ctx.request.body
    const res = await register(email, password)
    ctx.body = res
})

//  login
router.post('/', async (ctx, next) => {
    const { email, password } = ctx.request.body
    const resModel = await findUser(email, password)

    if( !resModel.errno && password && ctx.session.user == null ){
        ctx.session.user = resModel.data
    }

    ctx.body = resModel
})

//  logout
router.get('/logout', api_check_login, async (ctx, next) => {
    console.log('@1++')
    ctx.body = await logout(ctx)
})

//  setting
router.patch('/:avatar_hash', api_check_login, parse_user_data, validate_user_update ,async(ctx, next) => {
    let resModel = await modifyUserInfo(ctx)
    ctx.session.user = resModel.data

    ctx.body = resModel
})

//---
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

router.get('/moreNews' , api_check_login, async(ctx, next) => {
    const { id } = ctx.session.user
    const { offset } = ctx.query
    const { data } = await getNews(id, offset)
    ctx.body = data
})

module.exports = router