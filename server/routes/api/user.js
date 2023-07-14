/**
 * @description API user相關
 */
//  0516
const { API: { VALIDATE, SESSION, CHECK, CACHE, FIREBASE } } = require('../../middleware')
const IdolFans = require('../../controller/idolFans')               //  0406
const User = require('../../controller/user')                       //  0404
const router = require('koa-router')()                              //  0404
router.prefix('/api/user')
router.post('/confirmPassword', CHECK.login, async (ctx, next) => {
    let { email } = ctx.session.user
    let { origin_password: password } = ctx.request.body
    ctx.body = await User.login(email, password)
})
//  0514
//  setting
router.patch('/', CHECK.login , SESSION.reset, CACHE.modify, FIREBASE.user, VALIDATE.user, async (ctx, next) => {
    let { id } = ctx.session.user
    let { body: newData } = ctx.request
    ctx.body = await User.modify(newData, id)
})
//  0406
//  取消追蹤
router.post('/cancelFollow', CHECK.login, CACHE.modify, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await IdolFans.cancelFollow({ fans_id, idol_id })
})
//  0406
//  追蹤
router.post('/follow', CHECK.login, CACHE.modify, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await IdolFans.follow({ fans_id, idol_id })
})
//  0404
//  登出
router.get('/logout', CHECK.login, SESSION.remove)
//  0404
//  登入
router.post('/', SESSION.set, VALIDATE.user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await User.login(email, password)
})
//  0404
//  驗證信箱是否已被註冊
router.post('/isEmailExist', VALIDATE.user, async (ctx, next) => {
    const { email } = ctx.request.body
    ctx.body = await User.isEmailExist(email)
})
//  0404
//  註冊
router.post('/register', VALIDATE.user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await User.register(email, password)
})
module.exports = router