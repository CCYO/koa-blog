/**
 * @description 數據格式化
 */

const { USER: { AVATAR } } = require('../../conf/constant')

function init_user(user) {
    if (!user) {
        return null
    }
    return _init(user)
}

function init_users(users) {
    if (!users.length) {
        return []
    }
    return users.map(user => init_user(user))
}

function _init(user) {
    let json = user.toJSON
    let map = new Map(Object.entries(json))
    //  設置默認的nickname
    if (map.has('nickname') && !map.get('nickname')) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(map.get('email'))
        json.nickname = target
    }
    //  設置默認的avatar
    if (map.has('avatar') && !map.get('avatar')) {
        json.avatar = AVATAR
    }
    return json
}

module.exports = (user) => {
    if (Array.isArray(user)) {
        return init_users(user)
    } else {
        return init_user(user)
    }
}