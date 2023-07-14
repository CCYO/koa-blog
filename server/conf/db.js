/**
 * @description 緩存配置
 */

const { isProd } = require('../utils/env')

let REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
}

let MYSQL_CONF = {
    database: 'koa_blog',
    username: 'twccy007',
    password: 'Twccy0074147635010733003',
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql'
}

if(isProd){
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    },
    MYSQL_CONF = {
        database: 'koa_blog',
        username: 'twccy007',
        password: 'Twccy0074147635010733003',
        host: '127.0.0.1',
        port: '3306',
        dialect: 'mysql'
    }
}

module.exports = {
    REDIS_CONF,
    MYSQL_CONF,
    GFB_CONF: {
        storageBucket: 'webpackmultikoa.appspot.com'
        // storageBucket: 'koa-blog-0412.appspot.com'
    }
}


