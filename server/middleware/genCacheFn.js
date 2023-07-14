//  0504
const { CACHE: { STATUS } } = require('../conf/constant')
//  0504
const S_Cache = require('../server/cache')
//  0504
const common = (type) => async function (ctx, next) {
    let KEY = type
    let id = ctx.params.id * 1
    let ifNoneMatch = ctx.headers['if-none-match']
    //  向系統cache撈資料 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
    let cacheType = await S_Cache.getTYPE(type)
    let cache = await cacheType.get(id, ifNoneMatch)
    //  將數據綁在 ctx.cache
    ctx.cache = {
        [KEY]: cache
    }
    try{
    await next()
}catch(e){
    throw e
}
    //  判斷是否將數據存入系統緩存
    let { exist, data, etag } = ctx.cache[KEY]
    //  當前系統緩存，無資料 || eTag已過期
    if (exist === STATUS.NO_CACHE) {
        //  將blog存入系統緩存
        etag = await cacheType.set(id, data)
    }
    //  將etag傳給前端做緩存
    if (exist !== STATUS.HAS_FRESH_CACHE) {
        ctx.set({
            etag,
            ['Cache-Control']: 'no-cache'
        })
        console.log(`${KEY}/${id} 提供前端 etag 做緩存`)
    }
    delete ctx.cache
    return
}
//  0504
const private = (type) => async function (ctx, next) {
    let id = ctx.params.id * 1
    if(ctx.request.path === '/self'){
        id = ctx.session.user.id
    }
    let KEY = type
    //  edit頁面的緩存數據格式
    /**
     * { 
     * exist: 提取緩存數據的結果 ,
     * data: { currentUser, fansList, idolList, blogList } || undefined
     * }    
     */
    let cacheType = await S_Cache.getTYPE(type)
    let cache = await cacheType.get(id)
    ctx.cache = {
        [KEY]: cache
    }
    await next()
    console.log(123)
    let { exist, data } = ctx.cache[KEY]
    //  系統沒有應對的緩存資料
    if (exist === STATUS.NO_CACHE) {
        //  將blog存入系統緩存
        await cacheType.set(id, data)
    }
    //  不允許前端緩存
    ctx.set({
        ['Cache-Control']: 'no-store'
    })
    console.log(`不允許前端緩存 ${ctx.request.path} 響應的數據`)
    delete ctx.cache
    return
}

module.exports = {
    //  0504
    common,
    //  0504
    private
}