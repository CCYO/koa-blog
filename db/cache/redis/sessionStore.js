const redisStore = require('koa-redis')

const { REDIS_CONF } = require('../../../conf/db')

const store = redisStore({
    port: REDIS_CONF.port,
    host: REDIS_CONF.host,
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 //ms
    }
})

store.client
.on('connect', () => console.log('@ => Redis 已連線'))
.on('ready', () => console.log('@ => Redis 已準備完成'))
.on('error', (e) => console.error('@ => Redis 發生錯誤 !! ==> \n', e))

module.exports = store