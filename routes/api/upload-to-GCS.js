const fs = require('fs')

const router = require('koa-router')()

const { api_check_login } = require('../../middleware/check_login')

//  Req FormData(File) >>> Formitable >>> GCP
router.post('/api/upload_by_Formidable', api_check_login, async (ctx, next) => {
    let avatarUrl = await upload_avatar_to_GCS(ctx)
    return ctx.body = { errno: 0, data: avatarUrl }
})



module.exports = router