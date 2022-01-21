/**
 * @description 緩存配置
 */

const { isPro } = require('../utils/env')

let REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
}

if(isPro){
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

module.export = {
    REDIS_CONF
}


