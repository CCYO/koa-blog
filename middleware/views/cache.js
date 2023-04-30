const {
    //  0430
    CACHE: {
        //  0430
        TYPE: {
            //  0430
            PAGE
        },
        //  0430
        NO_IF_NONE_MATCH,
        //  0430
        IF_NONE_MATCH_IS_NO_FRESH,
        //  0430
        NO_CACHE
    },
} = require('../../conf/constant')
//  0430
const S_Cache = require('../../server/cache')
//  0430
//  取得/設置other頁的緩存
async function other(ctx, next) {
    let user_id = ctx.params.id * 1
    let ifNoneMatch = ctx.headers['if-none-match']
    //  other頁面的緩存數據格式
    /**
     * { 
     * exist: 提取緩存數據的結果 ,
     * data: { currentUser, fansList, idolList, blogList } || undefined
     * }    
     */
    let cacheStatus = await S_Cache.getUser(user_id, ifNoneMatch)
    ctx.cache = {
        [PAGE.USER]: cacheStatus
    }
    await next()

    //  判斷是否將數據存入系統緩存
    let { exist, data } = ctx.cache[PAGE.USER]
    let etag
    //  系統無有效的緩存數據
    if (exist === NO_CACHE || exist === IF_NONE_MATCH_IS_NO_FRESH) {
        //  將blog存入系統緩存
        etag = await S_Cache.setUser(user_id, data)
        //  系統緩存有資料，但請求未攜帶if-None-Match  
    } else if (exist === NO_IF_NONE_MATCH) {
        //  直接拿系統緩存的 etag
        etag = await S_Cache.getEtag(`${PAGE.USER}/${user_id}`)
    }
    //  將etag傳給前端做緩存
    if (etag) {
        ctx.set({
            etag,
            ['Cache-Control']: 'no-cache'
        })
        console.log(`${PAGE.USER}/${user_id} 提供前端 etag 做緩存`)
    }
    delete ctx.cache
    return
}
module.exports = {
    //  0430
    other
}