/**
 * @description API user相關
 */
const IdolFans = require('../../controller/idolFans')               //  0406
const Cache = require('../../middleware/cache')                     //  未處理
const Check = require('../../middleware/check_login') //  0228
const Session = require('../../middleware/session')                 //  0228
const User = require('../../controller/user')                       //  0404
const { validate_user } = require('../../middleware/validate')      //  0404
const router = require('koa-router')()                              //  0404
router.prefix('/api/user')       
//  0406
//  取消追蹤
router.post('/cancelFollow', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await IdolFans.cancelFollow({ fans_id, idol_id })
})
//  0406
//  追蹤
router.post('/follow', Check.api_logining, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await IdolFans.follow({ fans_id, idol_id })
})
//  0404
//  登出
router.get('/logout', Check.api_logining, Session.remove)
//  0404
//  登入
router.post('/', Session.set, validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await User.login(email, password)
})
//  0404
//  驗證信箱是否已被註冊
router.post('/isEmailExist', validate_user, async (ctx, next) => {
    const { email } = ctx.request.body
    ctx.body = await User.isEmailExist(email)
})
//  0404
//  註冊
router.post('/register', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await User.register(email, password)
})




const { parse_user_data } = require('../../middleware/gcs')






//  setting 0309
router.patch('/', Check.api_logining, Session.set, Cache.modifiedtCache, parse_user_data, validate_user, async (ctx, next) => {
    let { id } = ctx.session.user
    let { body: newData } = ctx.request
    ctx.body = await User.modifyUserInfo(newData, id)
})




module.exports = router