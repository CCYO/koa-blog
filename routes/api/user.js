/**
 * @description API user相關
 */
const { parse_user_data } = require('../../middleware/gcs')
const { validate_user } = require('../../middleware/validate')

const FollowPeople = require('../../controller/followPeople')
const User = require('../../controller/user')                       //  0228
const router = require('koa-router')()                              //  0228
const Cache = require('../../middleware/cache')                     //  0228
const Check = require('../../middleware/check_login') //  0228
const Session = require('../../middleware/session')                 //  0228
router.prefix('/api/user')

//  取消追蹤    0228
router.post('/cancelFollow', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await FollowPeople.cancelFollow({fans_id, idol_id})
})
//  追蹤    0228
router.post('/follow', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await FollowPeople.addFollow({fans_id, idol_id})
})
//  驗證信箱是否已被註冊    0228
router.post('/isEmailExist', validate_user, async (ctx, next) => {
    const { email } = ctx.request.body
    ctx.body = await User.isEmailExist(email)
})
//  註冊    0228
router.post('/register', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await User.register(email, password)
})

//  setting 0309
router.patch('/', Check.api_logining, Session.setLoginSession, Cache.modifiedtCache, parse_user_data, validate_user, async(ctx, next) => {
    let { id } = ctx.session.user
    let { body: newData } = ctx.request
    ctx.body = await User.modifyUserInfo(newData, id)
})

//  取得登入資料 0228
router.get('/', Check.api_logining, Session.getLoginSession)
//  登出    0228
router.get('/logout', Check.api_logining, Session.removeLoginSession)
//  登入    0228
router.post('/', Session.setLoginSession, validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    console.log(email, password)
    ctx.body = await User.login(email, password)
})



module.exports = router