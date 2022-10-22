/**
 * @description API user相關
 */

const router = require('koa-router')()

const { 
    isEmailExist,
    register, 
    findUser,
    followIdol,
    cancelFollowIdol,
    modifyUserInfo    
} = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')
const { parse_user_data } = require('../../middleware/gcs')
const { validate_user } = require('../../middleware/validate')
const { cache_reset } = require('../../middleware/cache')
const { login, logout } = require('../../middleware/loginAndOut')

const { getMe } = require('../../utils/user')

router.prefix('/api/user')

//  取得登入資料
router.get('/', api_check_login, getMe)

//  驗證信箱是否已被註冊
router.post('/isEmailExist', validate_user, async (ctx, next) => {
    const { email } = ctx.request.body
    ctx.body = await isEmailExist(email)
})

//  註冊
router.post('/register', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await register(email, password)
})

//  登入
router.post('/', validate_user, login, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await findUser({email, password})
})

//  追蹤
router.post('/follow', api_check_login, cache_reset, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await followIdol({fans_id, idol_id})
})

//  取消追蹤
router.post('/cancelFollow', api_check_login, cache_reset, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await cancelFollowIdol({fans_id, idol_id})
})

//  登出
router.get('/logout', api_check_login, logout)

//  setting
router.patch('/', api_check_login, cache_reset, login, parse_user_data, validate_user, async(ctx, next) => {
    let { id } = ctx.session.user
    let { body: newData } = ctx.request
    ctx.body = await modifyUserInfo(newData, id)
})

module.exports = router