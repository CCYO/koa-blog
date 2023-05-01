//  0501
const { MyErr, ErrRes } = require('../model')
//  0430
const Redis = require('../db/cache/redis/_redis')
//  0501
const ENV = require('../utils/env')
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
            let comments = await Redis.COMMENT.get()
            //  { etag: data }
            let cache = comments.get(id)
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

    getEtag,    //  0228
    setComment, //  0228
    getComment, //  0228
    setBlog,    //  0228
    getBlog,    //  0228
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



const { hash_obj } = require('../utils/crypto')     //  0228




//  0303
async function getEtag(cacheKey) {
    //  取緩存數據 { etag: resModel }
    let cachePair = await Redis.get(cacheKey)
    let [etag] = Object.entries(cachePair)[0]
    return etag
}
//  0228
async function setComment(blog_id, val = undefined) {
    if (ENV.isNoCache) {
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
async function getComment(blog_id, ifNoneMatch) {
    let cacheStatus = { exist: STATUS.NO_CACHE, data: undefined }
    if (ENV.isNoCache) {
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
    let [etag, resModel] = Object.entries(cachePair)[0]
    cacheStatus.data = resModel
    console.log(`@ 系統緩存 ${cacheKey} 有資料`)

    if (etag === ifNoneMatch) {
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
    if (ENV.isNoCache) {
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
    if (ENV.isNoCache) {
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

    if (etag === ifNoneMatch) {
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

async function getUser(user_id, ifNoneMatch) {
    //  預設緩存狀態
    let cacheStatus = { exist: NO_CACHE, data: undefined }
    //  若是 nocache 模式，直接返回
    if (ENV.isNoCache) {
        return cacheStatus
    }
    //  Redis 內儲存的 user page 緩存數據，所代表的 key
    // let cacheKey = `${PAGE.USER}/${user_id}`
    //  取出 Redis 內儲存的 user page 緩存數據(JSON string格式)
    //  資料格式 [[hash, userData]]
    // let cachePair = await Redis.get(cacheKey)
    let cachePair = await Redis.get(id, ifNoneMatch)
    //  若緩存數據不存在，返回預設緩存狀態
    if (!cachePair) {
        console.log(`@系統緩存 ${cacheKey} 沒有資料`)
    } else {
        console.log(`@系統緩存 ${cacheKey} 有資料`)
        //  將緩存數據的 data 部分賦值給 cacheStatus.data
        let [etag, data] = Object.entries(cachePair)[0]
        cacheStatus.data = data
        if (!ifNoneMatch) {
            //  若沒有可與etag作匹配的if-none-match
            //  cacheStatus.status設置為NO_IF_NONE_MATCH(未攜帶if-none-match)
            console.log(`@此次 ${cacheKey} 緩存請求未攜帶 if-none-match`)
            cacheStatus.exist = STATUS.NO_IF_NONE_MATCH
        } else if (ifNoneMatch !== etag) {
            //  若 if-none-match 無法匹配 etag，代表前端數據已過期
            //  cacheStatus.status 設置為 IF_NONE_MATCH_IS_NO_FRESH(if-none-match 已過期)
            console.log(`@此次 ${cacheKey} if-none-match 與 etag 無法匹配，代表前端數據已過期`)
            cacheStatus.exist = IF_NONE_MATCH_IS_NO_FRESH   //  if-none-match 已過期
        } else {
            //  具備 if-none-match，且與 etag 相匹配，代表前端數據扔是最新的
            //  cacheStatus.status 設置為 HAS_FRESH_CACHE
            console.log(`@此次 ${cacheKey} if-none-match 與 etag 相匹配，代表前端數據仍是最新的`)
            cacheStatus.exist = HAS_FRESH_CACHE  //  if-none-match 仍是最新的
        }
    }
    return cacheStatus
}
const {
    //  0430
    CACHE: {
        //  0430
        TYPE: {
            //  0430
            PAGE,
            API,
            NEWS,
        },
        //  0501
        STATUS
    } } = require('../conf/constant')