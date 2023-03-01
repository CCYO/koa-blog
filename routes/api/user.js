/**
 * @description API user相關
 */

const router = require('koa-router')()  //  0228

const Cache = require('../../middleware/cache') //  0228

const {
    api_check_login     //  0228
} = require('../../middleware/check_login')

const {
    removeLoginSession, //  0228
    setLoginSession,    //  0228
    getLoginSession     //  0228
} = require('../../middleware/session')

const { 
    modifyUserInfo,

    cancelFollowIdol,   //  0228
    followIdol,         //  0228
    login,              //  0228
    register,           //  0228
    isEmailExist,       //  0228
} = require('../../controller/user')


const { parse_user_data } = require('../../middleware/gcs')
const { validate_user } = require('../../middleware/validate')

router.prefix('/api/user')

//  取消追蹤    0228
router.post('/cancelFollow', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await cancelFollowIdol({fans_id, idol_id})
})

//  追蹤    0228
router.post('/follow', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await followIdol({fans_id, idol_id})
})

//  取得登入資料 0228
router.get('/', api_check_login, getLoginSession)

//  登出    0228
router.get('/logout', api_check_login, removeLoginSession)

//  登入    0228
router.post('/', setLoginSession, validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await login(email, password)
})

//  註冊    0228
router.post('/register', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await register(email, password)
})

//  驗證信箱是否已被註冊    0228
router.post('/isEmailExist', validate_user, async (ctx, next) => {
    const { email } = ctx.request.body
    ctx.body = await isEmailExist(email)
})


















//  setting
router.patch('/', api_check_login, setLoginSession, parse_user_data, validate_user, async(ctx, next) => {
    let { id } = ctx.session.user
    let { body: newData } = ctx.request
    ctx.body = await modifyUserInfo(newData, id)
})

module.exports = router