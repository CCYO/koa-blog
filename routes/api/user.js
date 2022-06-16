/**
 * @description API user相關
 */

const router = require('koa-router')()

const { 
    isEmailExist,
    register, 

    findUser, modifyUserInfo, followIdol, cancelFollowIdol, logout, getNews, confirmUserNews, readMore,
    
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

//  register
router.post('/register', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    ctx.body = await register(email, password)
})

//  login
router.post('/', validate_user, async (ctx, next) => {
    const { email, password } = ctx.request.body
    const resModel = await findUser(email, password)

    if(!resModel.errno && !ctx.session.user){
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
router.patch('/:avatar_hash', api_check_login, parse_user_data, validate_user ,async(ctx, next) => {
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

router.post('/readMore' , api_check_login, async(ctx, next) => {
    const { id } = ctx.session.user
    const { checkTime, index, window_news_count } = ctx.request.body

    ctx.body = await readMore(id, index * 1, checkTime, window_news_count)
})

router.get('/news_confirm', api_check_login, async(ctx, next) => {
    const { confirm_time } = ctx.query
    let res = await confirmUserNews(ctx.session.user.id, confirm_time * 1)
    ctx.body = res
})

module.exports = router