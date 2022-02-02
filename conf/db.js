/**
 * @description 緩存配置
 */

const { isPro } = require('../utils/env')

let REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
}

let MYSQL_CONF = {
    database: 'koa_blog',
    username: 'root',
    password: 'tt309091238',
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql'
}

if(isPro){
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    },
    MYSQL_CONF = {
        database: 'koa_blog',
        username: 'root',
        password: 'tt309091238',
        host: '127.0.0.1',
        port: '3306',
        dialect: 'mysql'
    }
}

module.exports = {
    REDIS_CONF,
    MYSQL_CONF
}


