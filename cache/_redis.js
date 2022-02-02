/**
 * @description redis methods: set & get
 */

const redis = require('redis')

const { REDIS_CONF } = require('./conf/db')

const cli = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)

cli.on('error', (e) => console.log('@Redis Error --> ', e))

/**
 * redis set
 * @param {string} key 鍵
 * @param {string} val 值
 * @param {number} timeout 過期時間
 */
const set = (key, val, timeout = 60 * 60) => {
    if(typeof val === 'object'){
        val = JSON.stringify(val)
    }
    cli.set(key, val)
    cli.expire(key, timeout)
}

/**
 * redis get
 * @param {string} key 鑑
 */
const get = (key) => {
    const promise = new Promise((resolve, rejects) => {
        cli.get(key, (err, val) => {
            if(err){
                rejects(err)
                return
            }
            if(val === null){
                resolve(null)
                return
            }
            try {
                resolve(
                    JSON.parse(val)
                )
            } catch(err){
                resolve(val)
            }
        })
    })
    return promise
}

module.exports = {
    set,
    get
}