/**
 * @description API news相關
 */

const router = require('koa-router')()

const {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews,

    readMore
} = require('../../controller/news')

const { api_check_login } = require('../../middleware/check_login')
const { cacheNews } = require('../../middleware/cache')

router.prefix('/api/news')

router.get('/', api_check_login, cacheNews, async (ctx, next) => {
    const { id } = ctx.session.user
    let res = await getNewsByUserId(id)
    console.log(`@存放session.news[0]`)
    if(!res.errno){
        res.data = {...res.data, me: {...ctx.session.user}}
    }
    ctx.body = ctx.session.news[0] = res
})

router.post('/', api_check_login, cacheNews, async ( ctx, next) => {
    ctx.body = await readMore(ctx)
})

router.post('/', api_check_login, cacheNews, async ( ctx, next) => {
    const { id } = ctx.session.user
    let { excepts, page } = ctx.request.body
    let { resModel, etag } = await getNewsByUserId(id, excepts, page)
    ctx.set({
        etag,
        ['Cache-Control']: 'no-cache'
    })
    ctx.body = resModel
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