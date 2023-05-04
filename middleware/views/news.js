//  0430
const S_CACHE = require('../../server/cache')
//  0430
const C_News = require('../../controller/news')
//  0430
const { ErrRes, ErrModel } = require('../../model')
//  0430
async function confirm(ctx, next) {
    let type = ctx.query.type && ctx.query.type * 1
    let id = ctx.query.id && ctx.query.id * 1
    if (type && id) {
        let user_id = ctx.session.user && ctx.session.user.id
        if (!user_id) {
            await ctx.render('page404', new ErrModel(ErrRes.PERMISSION.NO_LOGIN))
            return
        }
        await C_News.confirm({ type, id })
        let cache = await S_CACHE.getNews()
        //  「通知」數據有變動
        await cache.addList([user_id])
    }
    await next()
}

module.exports = {
    confirm
}