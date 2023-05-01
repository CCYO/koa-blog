//  0430
const { CACHE: { TYPE, STATUS } } = require('../../conf/constant')
//  0430
const S_Cache = require('../../server/cache')
//  0501
const BLOG = {
    KEY: TYPE.PAGE.BLOG,
    //  0303
    async page(ctx, next) {
        let KEY = BLOG.KEY
        let blog_id = ctx.params.blog_id * 1
        let ifNoneMatch = ctx.headers['if-none-match']
        //  向系統cache撈資料 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
        let cache = await S_Cache.BLOG.get(blog_id, ifNoneMatch)
        //  將數據綁在 ctx.cache
        ctx.cache = {
            [KEY]: cache
        }
        await next()
        //  判斷是否將數據存入系統緩存
        let { exist, data, etag } = ctx.cache[KEY]
        //  當前系統緩存，無資料 || eTag已過期
        if (exist === STATUS.NO_CACHE) {
            //  將blog存入系統緩存
            etag = await S_Cache.BLOG.set(blog_id, data)
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
//  0501
const USER = {
    //  0430
    KEY: TYPE.PAGE.USER,
    //  0430
    //  取得/設置userPage的緩存
    async self(ctx, next) {
        let user_id = ctx.session.user.id * 1
        let KEY = USER.KEY
        //  self頁面的緩存數據格式
        /**
         * { 
         * exist: 提取緩存數據的結果 ,
         * data: { currentUser, fansList, idolList, blogList } || undefined
         * }    
         */
        let cache = await S_Cache.USER.get(user_id)
        ctx.cache = {
            [KEY]: cache
        }
        await next()
        //  系統沒有應對的緩存資料
        let { exist, data } = ctx.cache[KEY]
        if (exist === STATUS.NO_CACHE) {
            //  將user存入系統緩存
            await S_Cache.USER.set(user_id, data)
        }
        //  不允許前端緩存
        ctx.set({
            ['Cache-Control']: 'no-store'
        })
        console.log(`不允許前端緩存 ${ctx.request.path} 響應的數據`)
        delete ctx.cache
        return
    },
    //  0430
    //  取得/設置userPage的緩存
    async other(ctx, next) {
        let KEY = USER.KEY
        let user_id = ctx.params.id * 1
        let ifNoneMatch = ctx.headers['if-none-match']
        //  other頁面的緩存數據格式
        /**
         * { 
         * exist: 提取緩存數據的結果 ,
         * data: { currentUser, fansList, idolList, blogList } || undefined
         * }    
         */
        let cache = await S_Cache.USER.get(user_id, ifNoneMatch)
        //  將緩存數據賦值在ctx.cache
        ctx.cache = {
            [KEY]: cache
        }
        await next()
        //  判斷是否將數據存入系統緩存
        let { exist, data, etag } = ctx.cache[KEY]
        //  當前系統緩存，無資料 || eTag已過期
        if (exist === STATUS.NO_CACHE) {
            //  將blog存入系統緩存
            etag = await S_Cache.USER.set(user_id, data)
        }
        //  將etag傳給前端做緩存
        if (exist !== STATUS.HAS_FRESH_CACHE) {
            ctx.set({
                etag,
                ['Cache-Control']: 'no-cache'
            })
            console.log(`${KEY}/${user_id} 提供前端 etag 做緩存`)
        }
        delete ctx.cache
        return
    },

}
module.exports = {
    //  0501
    BLOG,
    //  0430
    USER
}