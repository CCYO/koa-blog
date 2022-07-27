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
    const { listOfNewsId } = ctx.request.body
    //  { people: [id, ...], blogs: [id, ...]}
    ctx.body = await confirmNews(listOfNewsId)
})

router.post('/readMore', api_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { markTime, listOfNewsId } = ctx.request.body
    let fromFront = true
    // { numOfunconfirm, total, count, htmlStr, ListOfConfirmNewsId: { people, blogs } } = res
    ctx.body = await readMoreByUserId(id, markTime, listOfNewsId, fromFront)
})

module.exports = router