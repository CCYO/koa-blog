//  0501
const S_Cache = require('../../server/cache')

//  0503
async function modify(ctx, next){
    await next()

    //  SuccessModel.cache 無定義
    if (!ctx.body.cache) {
        return
    }

    await S_Cache.modify(ctx.body.cache)
    //  移除 SuccessModel.cache
    delete ctx.body.cache
    return
}

module.exports = {
    COMMENT
}