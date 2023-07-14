/**
 * @description 加密
 */
const crypto = require('crypto')    //  0404
//  0404
const hash = (data) => {
    const md5 = crypto.createHash('md5')
    return md5.update(data).digest('hex')
}

const hash_obj = (obj) => {
    return hash(JSON.stringify(obj))
}

module.exports = {
    //  0404
    hash, 
    hash_obj
}