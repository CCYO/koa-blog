/**
 * @description redis methods: set & get
 */

const redis = require('redis')

const { REDIS_CONF } = require('../../../conf/db')

const cli = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
cli.on('error', (e) => console.log('@Redis Error --> ', e))
cli.on('connect', () => console.log('@ => Redis 連線ok'))
cli.connect()


/**
 * redis set
 * @param {string} key 鍵
 * @param {string} val 值
 * @param {number} timeout 過期時間
 */
const set = async (key, val, timeout = 60 * 60) => {
    if (typeof val === 'object') {
        val = JSON.stringify(val)
    }
    await cli.set(key, val)
    await cli.expire(key, timeout)
    console.log('@red set ok!')
}

async function set_blog(blog_id, hash, val) {
    await set(`blog/${blog_id}:${hash}`, val)
}

/**
 * redis get
 * @param {string} key 鑑
 */
const get = async (key) => {
    let val = await cli.get(key)
    if (val === null) {
        return null
    }
    try {
        return JSON.parse(val)
    } catch (err) {
        return val
    }
}

async function get_blog(blog_id, hash) {
    let val = await get(`blog/${blog_id}:${hash}`)
    return val
}

module.exports = {
    set,
    get,
    get_blog,
    set_blog
}