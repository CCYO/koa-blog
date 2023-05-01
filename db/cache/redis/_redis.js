/**
 * @description redis methods: set & get
 */
//  0501
const crypto = require('../../../utils/crypto')
//  0501
const { CACHE: { TYPE } } = require('../../../conf/constant')
//  0501
const { REDIS_CONF } = require('../../../conf/key/db')
//  0501
const redis = require('redis')

const cli = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
cli.on('error', (e) => console.log('@Redis Error --> ', e))
cli.on('connect', () => console.log('@ => Redis cache init -- ok'))
//  0501
const Redis = {
    //  0501
    async get(key) {
        let val = await cli.get(key)
        if (val === null) {
            return null
        }
        try {
            return JSON.parse(val)
        } catch (err) {
            return val
        }
    },
    //  0501
    async set(key, val, timeout = 60 * 60) {
        try {
            if (typeof val === 'object') {
                val = JSON.stringify(val)
            }
            await cli.set(key, val)
            await cli.expire(key, timeout)
        } catch (err) {
            throw err
        }
    },
    //  0501
    async clear(key) {
        await cli.del(key)
        console.log(`@ 清除系統緩存 --> cache/${key}`)
        return true
    },

}
//  0501
const COMMENT = {
    KEY: TYPE.API.COMMENT,
    async get() {
        //  [ [blog_id, { etag: SuccModel }], ... ]
        let arr = await Redis.get(COMMENT.KEY)
        //  { etag: data }
        return new Map(arr)
    },
    async set(id, data) {
        //  [ [blog_id, { etag: SuccModel }], ... ]
        let comments = await COMMENT.get()
        let KEY = COMMENT.KEY
        if (!data) {
            await Redis.set(KEY, undefined)
            return true
        }
        let etag = crypto.hash_obj(data)
        console.log(`@ 系統緩存 ${KEY}/${id} 生成 etag => `, etag)
        let cache = { [etag]: data }
        let map = comments.set(id, cache)
        newCache = [...map.entries()]
        await Redis.set(KEY, newCache)
        console.log(`@ 系統緩存 ${KEY}/${id} 完成緩存`)
        return etag
    },
    async clear(id) {
        return await COMMENT.set(id)
    }
}
//  0501
const BLOG = {
    KEY: TYPE.PAGE.BLOG,
    async get() {
        //  [ [blog_id, { etag: data }], ... ]
        let arr = await Redis.get(BLOG.KEY)
        //  { etag: data }
        return new Map(arr)
    },
    async set(id, data) {
        //  [ [blog_id, { etag: data }], ... ]
        let blogs = await BLOG.get()
        let KEY = BLOG.KEY
        if (!data) {
            await Redis.set(KEY, undefined)
            return true
        }
        let etag = crypto.hash_obj(data)
        console.log(`@ 系統緩存 ${KEY}/${id} 生成 etag => `, etag)
        let cache = { [etag]: data }
        let map = blogs.set(id, cache)
        newCache = [...map.entries()]
        await Redis.set(KEY, newCache)
        console.log(`@ 系統緩存 ${KEY}/${id} 完成緩存`)
        return etag
    },
    async clear(id) {
        return await BLOG.set(id)
    }
}
//  0501
const USER = {
    KEY: TYPE.PAGE.USER,
    async get() {
        //  [ [user_id, { etag: data }], ... ]
        let arr = await Redis.get(USER.KEY)
        //  { etag: data }
        return new Map(arr)
    },
    async set(id, data) {
        //  [ [user_id, { etag: data }], ... ]
        let users = await USER.get()
        let KEY = USER.KEY
        if (!data) {
            await Redis.set(KEY, undefined)
            return true
        }
        let etag = crypto.hash_obj(data)
        console.log(`@ 系統緩存 ${KEY}/${id} 生成 etag => `, etag)
        let cache = { [etag]: data }
        let map = users.set(id, cache)
        newCache = [...map.entries()]
        await Redis.set(KEY, newCache)
        console.log(`@ 系統緩存 ${KEY}/${id} 完成緩存`)
        return etag
    },
    async clear(id) {
        return await USER.set(id)
    }
}
//  0501
const NEWS = {
    //  0501
    async init() {
        let KEY = NEWS.KEY
        let news = await Redis.get(KEY)
        if (!news) {
            await Redis.set(KEY, [])
        }
        return
    },
    KEY: TYPE.NEWS
}
//  0501
async function init() {
    try {
        await cli.connect()
        await NEWS.init()
    } catch (e) {
        console.log('@ redis cache init ERR')
        throw new Error(e)
    }
}

module.exports = {
    //  0501
    COMMENT,
    //  0501
    BLOG,
    //  0430
    USER,
    Redis,
    init
}

