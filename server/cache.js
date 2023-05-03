//  0501
const { MyErr, ErrRes } = require('../model')
//  0430
const Redis = require('../db/cache/redis/_redis')
//  0503
const { CACHE: {
    //  0503
    STATUS,
    TYPE: { PAGE, API, NEWS },
} } = require('../conf/constant')
//  0501
const ENV = require('../utils/env')
//  0228
async function modify(cache) {
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
//  移除既存的緩存數據
async function reset(obj) {
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
//  0501
const COMMENT = {
    //  0501
    //  取得 commnet 緩存
    async get(id, ifNoneMatch) {
        let res = { exist: STATUS.NO_CACHE, data: undefined, etag: undefined }
        if (ENV.isNoCache) {
            return res
        }
        //  Map { blog_id => { etag: SuccModel }, ... }
        //  { etag: data }
        let cache = await Redis.COMMENT.get(id)
        if (!cache) {
            //  沒有緩存
            return res
        }
        //  使用 if-none-match 取出緩存數據
        let data = cache[ifNoneMatch]
        if (!ifNoneMatch) {
            //  沒有 if-none-match
            res.exist = STATUS.NO_IF_NONE_MATCH
        } else if (!data) {
            //  if-none-match 不匹配
            res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH
        } else {
            //  if-none-match 有效
            return { exist: STATUS.HAS_FRESH_CACHE, data, etag: ifNoneMatch }
        }
        //  分解緩存，取出 etag 與 緩存數據
        res.etag = Object.keys(cache)[0]
        res.data = Object.values(cache)[0]
        return res
    },
    //  0501
    //  設置 comment 緩存
    async set(id, data) {
        if (ENV.isNoCache) {
            return false
        }
        if (!data) {
            throw new MyErr(ErrRes.CACHE.COMMENT.SET.NOT_DATA)
        }
        let etag = await Redis.COMMENT.set(id, data)
        return etag
    },
    //  0501
    //  清除緩存
    async clear(id) {
        return await Redis.COMMENT.clear(id)
    }
}
//  0501
const BLOG = {
    //  0501
    //  取得 blog 緩存
    async get(id, ifNoneMatch) {
        let res = { exist: STATUS.NO_CACHE, data: undefined, etag: undefined }
        if (ENV.isNoCache) {
            return res
        }
        //  Map { blog_id => { etag: SuccModel }, ... }
        let blogs = await Redis.BLOG.get()
        //  { etag: data }
        let cache = blogs.get(id)
        if (!cache) {
            //  沒有緩存
            return res
        }
        //  使用 if-none-match 取出緩存數據
        let data = cache[ifNoneMatch]
        if (!ifNoneMatch) {
            //  沒有 if-none-match
            res.exist = STATUS.NO_IF_NONE_MATCH
        } else if (!data) {
            //  if-none-match 不匹配
            res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH
        } else {
            //  if-none-match 有效
            return { exist: STATUS.HAS_FRESH_CACHE, data, etag: ifNoneMatch }
        }
        //  分解緩存，取出 etag 與 緩存數據
        res.etag = Object.keys(cache)[0]
        res.data = Object.values(cache)[0]
        return res
    },
    //  0501
    //  設置 user 緩存
    async set(id, data) {
        if (ENV.isNoCache) {
            return false
        }
        if (!data) {
            throw new MyErr(ErrRes.CACHE.BLOG.SET.NOT_DATA)
        }
        let etag = await Redis.BLOG.set(id, data)
        return etag
    },
    //  0501
    //  清除緩存
    async clear(id) {
        return await Redis.BLOG.clear(id)
    }
}
//  0501
const USER = {
    //  0430
    //  取得 user 緩存
    async get(id, ifNoneMatch) {
        let res = { exist: STATUS.NO_CACHE, data: undefined, etag: undefined }
        if (ENV.isNoCache) {
            return res
        }
        //  Map { user_id => { etag: SuccModel }, ... }
        let users = await Redis.USER.get()
        //  { etag: data }
        let cache = users.get(id)
        if (!cache) {
            //  沒有緩存
            return res
        }
        //  使用 if-none-match 取出緩存數據
        let data = cache[ifNoneMatch]
        if (!ifNoneMatch) {
            //  沒有 if-none-match
            res.exist = STATUS.NO_IF_NONE_MATCH
        } else if (!data) {
            //  if-none-match 不匹配
            res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH
        } else {
            //  if-none-match 有效
            return { exist: STATUS.HAS_FRESH_CACHE, data, etag: ifNoneMatch }
        }
        //  分解緩存，取出 etag 與 緩存數據
        res.etag = Object.keys(cache)[0]
        res.data = Object.values(cache)[0]
        return res
    },
    //  0501
    //  設置 user 緩存
    async set(id, data) {
        if (ENV.isNoCache) {
            return false
        }
        if (!data) {
            throw new MyErr(ErrRes.CACHE.USER.SET.NOT_DATA)
        }
        let etag = await Redis.USER.set(id, data)
        return etag
    },
    //  0501
    //  清除緩存
    async clear(id) {
        return await Redis.USER.clear(id)
    }
}

module.exports = {
    //  0501
    COMMENT,
    //  0501
    BLOG,
    //  0501
    USER,

    remindNews, //  0430
    modifyCache,//  0228
    removeRemindNews,
    checkNews,
}

//  0430
async function remindNews(user) {
    let list = await Redis.get('cacheNews')
    let set = new Set(list)
    set.add(user)
    await Redis.set('cacheNews', [...set])
    return true
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
