//  0501
const S_Cache = require('../../server/cache')
//  0501
const { CACHE: { TYPE, STATUS } } = require('../../conf/constant')
//  0501
const COMMENT = {
    KEY: TYPE.API.COMMENT,
    async cache(ctx, next) {
        let KEY = COMMENT.KEY
        let blog_id = ctx.params.blog_id * 1
        let ifNoneMatch = ctx.headers['if-none-match']
        /**
         * {
         * exist: 緩存提取結果,
         * data: 
         **** resModel { errno, data: 對應blogPage格式化的comments數據 } ||
         **** undefined 
         * }
         */
        //  
        let cache = await S_Cache.COMMENT.get(blog_id, ifNoneMatch)
        ctx.cache = {
            [KEY]: cache
        }
        await next()
        //  判斷是否將數據存入系統緩存
        let { exist, data, etag } = ctx.cache[KEY]
        //  當前系統緩存，無資料 || eTag已過期
        if (exist === STATUS.NO_CACHE) {
            //  將blog存入系統緩存
            etag = await S_Cache.COMMENT.set(blog_id, data)
        }
        //  將etag傳給前端做緩存
        if (exist !== STATUS.HAS_FRESH_CACHE) {
            ctx.set({
                etag,
                ['Cache-Control']: 'no-cache'
            })
            console.log(`${KEY}/${blog_id} 提供前端 etag 做緩存`)
        }
        delete ctx.cache
        return
    }
}
module.exports = {
    COMMENT
}