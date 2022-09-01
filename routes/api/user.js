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
        if(!ctx.session.news){
            ctx.session.news = []
        }
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

//  setting
router.patch('/', api_check_login, parse_user_data, validate_user, async(ctx, next) => {
    let { id } = ctx.session
    let { body: newData } = ctx.request
    let res = await modifyUserInfo(newData, id)
    ctx.session.user = res.data
    ctx.body = res
})

const axios = require('axios')
router.get('/imgg' , async(ctx, next) => {
    let res = await axios.get('https://storage.googleapis.com/koa-blog-a003ccy.appspot.com/blogImg/046fabe56a4deaf4ea92625b9aed8a84.jpg', {responseType: 'stream'})
    res.data.on('data', () => { console.log('@ =========> data')})
    console.log('@res => ', res)
    console.log('@ res.headers => ', res.headers)
    console.log('@ res.header[content-type] => ', res.headers['content-type'])
    ctx.response.set('Content-Type', res.headers['content-type'])
    
    ctx.res.on('pipe', (x) => console.log('@ =================================> go'))
    ctx.res.on('finish', (x) => console.log('@ =================================> finish'))
    ctx.body = res.data
})

module.exports = router