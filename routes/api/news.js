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

const { api_check_login, api_check_isMe } = require('../../middleware/check_login')
const { cacheNews, cache_reset } = require('../../middleware/cache')

router.prefix('/api/news')

router.post('/', api_check_login, cache_reset, cacheNews, async ( ctx, next) => {
    const id = ctx.session.user.id
    let res
    if(ctx.request.body.page === 0){
        res = await getNewsByUserId(id)
    }else{
        //  let { page, newsList, excepts } = ctx.request.body
        res = await readMore({id, ...ctx.request.body})
    }

    ctx.body = res
})

module.exports = router