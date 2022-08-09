/**
 * @description 數據格式化
 */

const { USER: { AVATAR } } = require('../../conf/constant')

function init_user(user) {
    if (user instanceof Array) {
        let res = []

        user.forEach(item => {
            res.push(_init_user(item))
        })

        return res
    }

    return _init_user(user)
}

function _init_user(user) {
    let json_user = user.toJSON ? user.toJSON() : user

    const { email, nickname, avatar } = json_user

    if (!nickname) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        json_user.nickname = target
    }
    if(json_user.hasOwnProperty('avatar') && !avatar){
        json_user.avatar = AVATAR
    }
    delete json_user.password
    return json_user
}

module.exports = {
    init_user
}