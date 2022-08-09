/**
 * @description API user相關
 */

const router = require('koa-router')()

const { 
    isEmailExist,
    register, 

    findUser, modifyUserInfo, followIdol, cancelFollowIdol, logout    
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

//  setting //validate_user ,
router.patch('/:avatar_hash', api_check_login, parse_user_data, async(ctx, next) => {
    let res = await modifyUserInfo(ctx)
    console.log('@data => ', res.data)
    ctx.session.user = res.data

    ctx.body = res
})

//---


router.get('/news_confirm', api_check_login, async(ctx, next) => {
    const { confirm_time } = ctx.query
    let res = await confirmUserNews(ctx.session.user.id, confirm_time * 1)
    ctx.body = res
})

module.exports = router