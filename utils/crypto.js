/**
 * @description 加密
 */

const crypto = require('crypto')

const hash = (data) => {
    const md5 = crypto.createHash('md5')
    return md5.update(data).digest('hex')
}

module.exports = hash