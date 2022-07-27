const router = require('koa-router')()


//  const { auth } = require('firebase-admin')

const { auth, storage } = require('../../firebase/init')

const { parse } = require('../../utils/gcs')

const uid = 'uid1'


    
router.post('/api/customToken', async (ctx, next) => {
    const token = await auth.createCustomToken(uid)
    const {user} = ctx.request.body
    ctx.body = token
})

router.get('/view/token', async (ctx, next) => {
    await ctx.render('token')
})

router.post('/api/file' , async (ctx, next) => {
    const ref = `GFB/999.jpg`
    let file_ref = storage.bucket().file(ref)
    ctx._my = {}
    ctx._my.file = file_ref
    await parse(ctx)
    
    ctx.body = {
        errno: 0,
        data: { ref }
    }
    
})



module.exports = router