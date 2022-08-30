/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')
const { cacheNews } = require('../../middleware/cache')

router.prefix('/api/news')

router.post('/', api_check_login, cacheNews, async ( ctx, next) => {
    const { id } = ctx.session.user
    let { excepts } = ctx.request.body
    ctx.body = await getNewsByUserId(id, excepts)
    
})

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
    // { numOfunconfirm, total, count, htmlStr, ListOfConfirmNewsId: { people, blogs, comments } } = res
    ctx.body = await readMoreByUserId(id, markTime, listOfNewsId, fromFront)
})

module.exports = router