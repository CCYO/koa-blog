/**
 * @description API user相關
 */

const router = require('koa-router')()

const { register, findUser, modifyUserInfo, logout } = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')

const { validate_user_register, validate_user_update } = require('../../middleware/validate')

router.prefix('/api/user')

//  register
router.post('/register', validate_user_register, async (ctx, next) => {
    const { email, password } = ctx.request.body
    console.log('@@@email => ', email)
    console.log('@@@password => ', password)
    const res = await register(email, password)
    console.log('確認有無 ctx.session.user => ', ctx.session.user)
    ctx.body = res
})

//  login
router.post('/', async (ctx, next) => {
    const { email, password } = ctx.request.body
    console.log('確認有無 ctx.session.user => ', ctx.session.user)
    const resModel = await findUser(email, password)
    console.log('resModel.errno => ', resModel.errno)
    console.log('賦予 session 前 ctx.session.user => ', ctx.session.user)
    if( !resModel.errno && password && ctx.session.user == null ){
        console.log('準備賦予  ctx.session.user => ', ctx.session.user)
        console.log('resModel.data => ',resModel.data)
        ctx.session.user = resModel.data
    }
    console.log('賦予 session 後 ctx.session.user => ', ctx.session.user)
    ctx.body = resModel
})

router.post('/check_avatar', api_check_login, validate_user_update ,async(ctx, next) => {
    if(ctx.session.user.avatar_md5Hash === ctx.request.body.avatar_md5Hash){
        ctx.body = { errno: 1, msg: "重複上傳了"}
    }else{
        ctx.body = { errno: 0, data: "騷包，這是新的頭像"}
    }
    return
})

//  setting
router.patch('/:hash',  api_check_login, validate_user_update, async (ctx, next) => {
    ctx.body = await modifyUserInfo(ctx)
})

router.post('/blog_img/:hash', async (ctx, next) => {
    let { url } = await upload_avatar_to_GCS(ctx) 
    ctx.body = { errno: 0, data: { url }} 
    return
    if( resModel.errno ){
        return { errno: 111}
    }else{
        ctx.session.user = resModel.data
        const { avatar_md5Hash } = resModel.data
        resModel = {
            "errno": 0, // 注意：值是数字，不能是字符串
            "data": {
                avatar_md5Hash,
                "url": ctx.fields.avatar, // 图片 src ，必须
                "alt": "yyy", // 图片描述文字，非必须
                "href": "zzz" // 图片的链接，非必须
            }
        }
    }
    ctx.body = resModel
})

router.get('/logout', api_check_login, async (ctx, next) => {
    ctx.body = logout(ctx)
})

module.exports = router