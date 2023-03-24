/**
 * @description 數據格式化
 */

const { USER: { AVATAR } } = require('../../conf/constant')

const init = (json) => {
    let data = { ...json }
    let map = new Map(Object.entries(data))
    //  設置默認的nickname
    if (map.has('nickname') && !map.get('nickname')) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(map.get('email'))
        data.nickname = target
    }
    //  設置默認的avatar
    if (map.has('avatar') && !map.get('avatar')) {
        data.avatar = AVATAR
    }
    return data
}

module.exports = init