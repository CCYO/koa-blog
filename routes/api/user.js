/**
 * @description API user相關
 */
const { parse_user_data } = require('../../middleware/gcs')
const { validate_user } = require('../../middleware/validate')

const User = require('../../controller/user')                       //  0228
const router = require('koa-router')()                              //  0228
const Cache = require('../../middleware/cache')                     //  0228
const { api_check_login } = require('../../middleware/check_login') //  0228
const Session = require('../../middleware/session')                 //  0228
router.prefix('/api/user')

//  setting
router.patch('/', api_check_login, Session.setLoginSession, Cache.modifiedtCache, parse_user_data, validate_user, async(ctx, next) => {
    let { id } = ctx.session.user
    let { body: newData } = ctx.request
    ctx.body = await User.modifyUserInfo(newData, id)
})

//  取消追蹤    0228
router.post('/cancelFollow', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await User.cancelFollowIdol({fans_id, idol_id})
})
//  追蹤    0228
router.post('/follow', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await User.followIdol({fans_id, idol_id})
})
//  取得登入資料 0228
router.get('/', api_check_login, Session.getLoginSession)
//  登出    0228
router.get('/logout', api_check_login, Session.removeLoginSession)
//  登入    0228
router.post('/', Session.setLoginSession, validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    console.log(email, password)
    ctx.body = await User.login(email, password)
})
//  註冊    0228
router.post('/register', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await User.register(email, password)
})
//  驗證信箱是否已被註冊    0228
router.post('/isEmailExist', validate_user, async (ctx, next) => {
    const { email } = ctx.request.body
    ctx.body = await User.isEmailExist(email)
})

module.exports = router