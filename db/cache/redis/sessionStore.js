const redisStore = require('koa-redis')

const { REDIS_CONF } = require('../../../conf/key/db')

const redis = require('redis')
const cli = redis.createClient()

const { init: initCache } = require('./_redis')

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
.on('connect', async () => {
  console.log('@ => Redis 已連線')
  await initCache()
})
.on('ready', () => console.log('@ => Redis 已準備完成'))
.on('error', (e) => console.error('@ => Redis 發生錯誤 !! ==> \n', e))

module.exports = store