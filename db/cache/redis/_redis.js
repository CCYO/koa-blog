/**
 * @description redis methods: set & get
 */

const redis = require('redis')
const { uuid } = require('uuidv4')

const { REDIS_CONF } = require('../../../conf/db')

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
    await set('cacheNews', [])
    return
}

async function checkNews(id){
    let r = await get('cacheNews')
    console.log('@r => ',r)
    let news = new Set(await get('cacheNews'))
    return news.has(id)
}

async function remindNews(id, data){
    let news = new Set(await get('cacheNews'))
    let listOfUserId = id
    if(!Array.isArray(listOfUserId)){
        listOfUserId = [listOfUserId]
    }

    listOfUserId.forEach( (item) => {
        news.add(item)
    })

    await set('cacheNews', news)
    return news
}

async function removeRemindNews(id){
    let r = await get('cacheNews')
    console.log('@rrr => ', r)
    let news = new Set(r)
    let listOfUserId = id
    if(!Array.isArray(listOfUserId)){
        listOfUserId = [listOfUserId]
    }
    
    listOfUserId.forEach( (item) => {
        news.delete(item)
    })

    await set('cacheNews', [...news])
    
    return news
}

async function set_blog(blog_id, hash, val) {
    await set(`blog/${blog_id}:${hash}`, val)
}

async function get_blog(blog_id, hash) {
    let val = await get(`blog/${blog_id}:${hash}`)
    return val
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
    set,
    get,
    get_blog,
    set_blog,
    checkNews,
    remindNews,
    removeRemindNews,
    initCache
}