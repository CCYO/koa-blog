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
    logout,
    
    modifyUserInfo    
} = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')
const { parse_user_data } = require('../../middleware/gcs')
const { validate_user } = require('../../middleware/validate')

router.prefix('/api/user')

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
router.post('/', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    const resModel = await findUser({email, password})
    //  判斷 session 是否存在，並儲存
    if(!resModel.errno && !ctx.session.user){
        ctx.session.user = resModel.data
    } 
    
    ctx.body = resModel
})

//  追蹤
router.post('/follow', async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await followIdol({fans_id, idol_id})
})

//  取消追蹤
router.post('/cancelFollow', async (ctx, next) => {
    const { id: idol_id } = ctx.request.body
    const { id: fans_id } = ctx.session.user
    ctx.body = await cancelFollowIdol({fans_id, idol_id})
})

//  logout
router.get('/logout', api_check_login, async (ctx, next) => {
    ctx.body = await logout(ctx)
})
//http://34.80.192.8:8080/api/user?avatar_hash=9c5ca35050e5dab58acbbd6cbf1c0de7&ext=jpg
//  setting //validate_user ,
router.patch('/', api_check_login, parse_user_data, validate_user, async(ctx, next) => {
    let res = await modifyUserInfo(ctx)
    ctx.session.user = res.data
    ctx.body = res
})

module.exports = router