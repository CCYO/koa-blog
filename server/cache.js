const { hash_obj } = require('../utils/crypto')     //  0228

const Redis = require('../db/cache/redis/_redis')   //  0228

const {
    isNoCache   //  0228
} = require('../utils/env')

const { CACHE: {
    TYPE: {
        API,    //  0228
        PAGE,   //  0228
        NEWS,
    },
    HAS_FRESH_CACHE, NO_IF_NONE_MATCH, IF_NONE_MATCH_IS_NO_FRESH,
    NO_CACHE    //  0228


} } = require('../conf/constant')

//  0228    取得 user 緩存
async function getUser(userId, ifNoneMatch) {
    let cacheStatus = { exist: NO_CACHE, data: undefined }
    if (isNoCache) {
        return cacheStatus
    }

    let cacheKey = `${PAGE.USER}/${userId}`
    //  取緩存KV [[hash, userData]]
    let cachePair = await Redis.get(cacheKey)
    if (!cachePair) {  //    若系統cache沒有資料
        console.log(`@系統緩存 ${cacheKey} 沒有資料`)
        return cacheStatus  //  exist: 1 代表無緩存
    }

    //  若系統cache有資料
    let [etag, data] = Object.entries(cachePair)[0]    //  [K, V]
    cacheStatus.data = data
    console.log(`@系統緩存 ${cacheKey} 有資料`)
    if (!ifNoneMatch) {
        console.log(`@此次 ${cacheKey} 緩存請求未攜帶 if-none-match`)
        cacheStatus.exist = NO_IF_NONE_MATCH   //  未攜帶 if-none-match
    } else if (ifNoneMatch !== etag) {
        console.log('@if-none-match => ', ifNoneMatch)
        console.log('@etag => ', etag)
        console.log(`@此次 ${cacheKey} if-none-match !== etag`)
        cacheStatus.exist = IF_NONE_MATCH_IS_NO_FRESH   //  if-none-match 已過期
    } else {
        console.log(`@此次 ${cacheKey} if-none-match 是最新的`)
        cacheStatus.exist = HAS_FRESH_CACHE  //  if-none-match 仍是最新的
    }
    return cacheStatus
}

//  0303
async function getEtag(cacheKey){
    //  取緩存數據 { etag: resModel }
    let cachePair = await Redis.get(cacheKey)
    let [etag] = Object.entries(cachePair)[0]
    return etag
}
//  0228
async function setComment(blog_id, val = undefined) {
    if (isNoCache) {
        return
    }
    let cacheKey = `${API.COMMENT}/${blog_id}`

    if (!val) {
        await Redis.set(cacheKey, '')
        return
    }
    let etag = hash_obj(val)
    console.log(`@ 系統緩存 ${cacheKey} 生成 etag => `, etag)
    await Redis.set(cacheKey, { [etag]: val })
    console.log(`@ 系統緩存 ${cacheKey} 完成緩存`)
    return etag
}

//  0228
async function getComment(blog_id, ifNoneMatch){
    let cacheStatus = { exist: NO_CACHE, data: undefined }
    if (isNoCache) {
        return cacheStatus
    }
    let cacheKey = `${API.COMMENT}/${blog_id}`
    //  取緩存數據 { etag: resModel }
    let cachePair = await Redis.get(cacheKey)
    //  系統cache沒有資料 
    if (!cachePair) {  
        console.log(`@ 系統緩存 ${cacheKey} 沒有資料`)
        return cacheStatus
    }
    //  系統cache有資料
    let [etag, resModel ] = Object.entries(cachePair)[0]
    cacheStatus.data = resModel
    console.log(`@ 系統緩存 ${cacheKey} 有資料`)

    if(etag === ifNoneMatch){
        console.log(`@ 此次 ${cacheKey} 請求攜帶的 if-none-match 匹配 etag`)
        cacheStatus.exist = HAS_FRESH_CACHE  //  if-none-match 仍是最新的
    } else if (!ifNoneMatch) {
        console.log(`@ 此次 ${cacheKey} 請求未攜帶 if-none-match`)
        cacheStatus.exist = NO_IF_NONE_MATCH   //  未攜帶 if-none-match
    } else if (ifNoneMatch !== etag) {
        console.log(`@ 此次 ${cacheKey} 請求攜帶的 if-none-match 已過期`)
        cacheStatus.exist = IF_NONE_MATCH_IS_NO_FRESH   //  if-none-match 已過期
    }
    return cacheStatus
}
//  0228
async function setBlog(blog_id, val = undefined) {
    if (isNoCache) {
        return
    }
    let cacheKey = `${PAGE.BLOG}/${blog_id}`

    if (!val) {
        await Redis.set(cacheKey, '')
        return
    }
    let etag = hash_obj(val)
    console.log(`@ 系統緩存 ${cacheKey} 生成 etag => `, etag)
    await Redis.set(cacheKey, { [etag]: val })
    console.log(`@ 系統緩存 ${cacheKey} 完成緩存`)
    return etag
}

//  0228
async function getBlog(blog_id, ifNoneMatch) {
    let cacheStatus = { exist: NO_CACHE, data: undefined }
    if (isNoCache) {
        return cacheStatus
    }
    let cacheKey = `${PAGE.BLOG}/${blog_id}`
    //  取緩存數據 { etag: resModel }
    let cachePair = await Redis.get(cacheKey)
    //  系統cache沒有資料 
    if (!cachePair) {  
        console.log(`@ 系統緩存 ${cacheKey} 沒有資料`)
        return cacheStatus
    }
    
    let [etag, resModel] = Object.entries(cachePair)[0]    //  [K, V]
    cacheStatus.data = resModel
    console.log(`@ 系統緩存 ${cacheKey} 有資料`)

    if(etag === ifNoneMatch){
        console.log(`@ 此次 ${cacheKey} 請求攜帶的 if-none-match 匹配 etag`)
        cacheStatus.exist = HAS_FRESH_CACHE  //  if-none-match 仍是最新的
    } else if (!ifNoneMatch) {
        console.log(`@ 此次 ${cacheKey} 請求未攜帶 if-none-match`)
        cacheStatus.exist = NO_IF_NONE_MATCH   //  未攜帶 if-none-match
    } else if (ifNoneMatch !== etag) {
        console.log(`@ 此次 ${cacheKey} 請求攜帶的 if-none-match 已過期`)
        cacheStatus.exist = IF_NONE_MATCH_IS_NO_FRESH   //  if-none-match 已過期
    }
    return cacheStatus
}

//  向相關使用者通知news有變動，待他們下一次請求時，主動向系統請求數據  0228
async function _addNewsCache(users) {
    //  當前若是 noCache 模式
    if (isNoCache || !users) {
        return
    }
    //  取出緩存資料 redis/cacheNews
    let cache = await Redis.get(NEWS)
    //  將資料設為 Set，以便除去重複值
    let people = new Set(cache)

    //  將 cache 與 user 合併
    users.forEach((user) => {
        people.add(user)
    })
    //  緩存
    await Redis.set(NEWS, [...people])
    console.log(`@ 系統緩存 ==> ${NEWS} :`, [...people])
    return true
}

//  0228
async function _removeCache(obj) {
    //  當前若是 noCache 模式
    if (isNoCache || !obj) {
        return
    }
    let kvPairs = Object.entries(obj)
    let promises = await kvPairs.map(async ([key, list]) => {
        let arr = []
        if (list) {
            list = [...new Set(list)]
            arr.push(await Promise.all(
                list.map(async id => await Redis.clear(`${key}/${id}`))
            ))
        }
        return await Promise.all(arr)
    })
    await Promise.all(promises)
    return true
}

//  0228
async function modifyCache(cache) {
    //  當前若是 noCache 模式 || SuccessModel.cache 無定義
    if (isNoCache || !cache) {
        return
    }

    await _removeCache({
        [PAGE.USER]: cache[PAGE.USER],
        [PAGE.BLOG]: cache[PAGE.BLOG],
        [API.COMMENT]: cache[API.COMMENT]
    })
    await _addNewsCache(cache[NEWS])

    return
}

//  0228
async function setUser(user_id, val = undefined) {
    if (isNoCache) {
        return
    }
    let cacheKey = `${PAGE.USER}/${user_id}`

    if (!val) {
        await Redis.set(cacheKey, '')
        return
    }
    let etag = hash_obj(val)
    console.log(`@ 系統緩存 ${cacheKey} 生成 etag => `, etag)
    console.log(`@ 系統緩存 ${cacheKey} 完成緩存`)
    await Redis.set(cacheKey, { [etag]: val })
    return etag
}

async function checkNews(id) {
    let cacheNews = await Redis.get('cacheNews')
    cacheNews = new Set(cacheNews)
    console.log(`@ 向系統緩存撈取 cacheNews 數據 =>`, [...cacheNews])
    return cacheNews.has(id)
}

async function removeRemindNews(id) {
    let r = await Redis.get('cacheNews')
    let news = new Set(r)
    let listOfUserId = id
    if (!Array.isArray(listOfUserId)) {
        listOfUserId = [listOfUserId]
    }

    listOfUserId.forEach((item) => {
        news.delete(item)
        console.log(`@ 從系統緩存 cacheNews 移除 ${item} `)
    })

    await Redis.set('cacheNews', [...news])

    return news
}

module.exports = {
    removeRemindNews,
    checkNews,

    getEtag,    //  0228
    setComment, //  0228
    getComment, //  0228
    setBlog,    //  0228
    getBlog,    //  0228
    modifyCache,//  0228
    setUser,    //  0228
    getUser,    //  0228
}