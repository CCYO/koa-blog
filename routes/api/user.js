/**
 * @description API user相關
 */

const router = require('koa-router')()

const { register, findUser, modifyUserInfo } = require('../../controller/user')

const { api_check_login } = require('../../middleware/check_login')

const { validate_user } = require('../../middleware/validate')

const upload_avatar_to_GCS = require('../../utils/upload_2_GCS_by_formidable')

router.prefix('/api/user')

//  register
router.post('/register', async (ctx, next) => {
    const { username, password } = ctx.request.body
    ctx.body = await register(username, password)
})

//  login
router.post('/', async (ctx, next) => {
    const { username, password } = ctx.request.body
    const resModel = await findUser(username, password)
    if( !resModel.errno && ctx.session.user == null ){        
        ctx.session.user = resModel.data
    }
    ctx.body = resModel
})

//  setting
router.patch('/',  api_check_login, validate_user, async (ctx, next) => {
    const { id } = ctx.session.user
    const { publicUrl, md5Hash } = await upload_avatar_to_GCS(ctx)
    const newUserInfo = { ...ctx.request.body, id }
    console.log(newUserInfo)
    const resModel = await modifyUserInfo(newUserInfo)
    if( !resModel.errno ){        
        ctx.session.user = resModel.data
    }
    ctx.body = resModel
})

router.get('/logout', api_check_login, async (ctx, next) => {
    ctx.body = 'okok'
})

module.exports = router