/**
 * @description redis methods: set & get
 */
//  0504
const { ErrRes, MyErr } = require('../../../model')
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
const getTYPE = (type) => ({
    async getMap() {
        //  [ [blog_id, { etag: SuccModel }], ... ]
        let arr = await Redis.get(type)
        return new Map(arr)
    },
    async get(id) {
        //  Map: { blog_id => { etag: SuccModel }, ... }
        let map = await this.getMap()
        //  { etag: data }
        return map.get(id)
    },
    async set(id, data) {
        //  [ [blog_id, { etag: SuccModel }], ... ]
        let map = await this.getMap()
        if (!id || !data) {
            throw new MyErr(ErrRes.CACHE.SET.NO_DATA(type))
        }
        let etag = crypto.hash_obj(data)
        console.log(`@ 系統緩存 ${type}/${id} 生成 etag => `, etag)
        let cache = { [etag]: data }
        map.set(id, cache)
        let newCache = [...map.entries()]
        await Redis.set(type, newCache)
        console.log(`@ 系統緩存 ${type}/${id} 完成緩存`)
        return etag
    },
    async clear(list) {
        let map = this.getMap()
        for (let id of list) {
            map.del(id)
        }
        await Redis.set(type, [...map.entries()])
        return true
    }
})
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
    //  0504
    getTYPE,
    Redis,
    init
}

