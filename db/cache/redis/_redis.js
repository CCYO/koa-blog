/**
 * @description redis methods: set & get
 */

const redis = require('redis')

const { REDIS_CONF } = require('../../../conf/key/db')

const cli = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
cli.on('error', (e) => console.log('@Redis Error --> ', e))
cli.on('connect', () => console.log('@ => Redis cache init -- ok'))

async function initCache(){
    try{
        await cli.connect()
        await init_cacheNews()
    }catch(e){
        console.log('@ redis cache init ERR => ', e)
    }
}

async function init_cacheNews(){
    let news = await get('cacheNews')
    if(!news){
        await set('cacheNews', [])    
    }
    return
}

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
    return true
}

const clear = async (key) => {
    await cli.del(key)
    console.log(`@ 清除系統緩存 --> cache/${key}`)
    return true
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

module.exports = {
    clear,

    set,
    get,
    initCache
}