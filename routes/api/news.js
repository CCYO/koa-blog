/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    readMoreByUserId,
    confirmNews
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/news')

router.patch('/', api_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { payload } = ctx.request.body
    //  { people: [id, ...], blogs: [id, ...]}
    ctx.body = await confirmNews(payload)
})

router.post('/readMore', api_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { markTime, confirmNews } = ctx.request.body
    let fromFront = true
    //  res = { ...htmlStr, numOfAfterMark, count: { confirm: confirm.length, unconfirm: unconfirm.length}}    
    let res = await readMoreByUserId(id, markTime, confirmNews, fromFront)

    console.log('@api res => ', res)
    ctx.body = res
})

router.post('/confirm', api_check_login, async (ctx, next) => {
    console.log('@body => ', ctx.request.body )
    const { payload } = ctx.request.body
    
    console.log('@payload => ', payload)
    let res = await confirmNews(payload)
    ctx.body = res
})

module.exports = router