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
    let peoson = user.toJSON ? user.toJSON() : user

    const { email, nickname, avatar } = peoson

    if (!nickname) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        peoson.nickname = target
    }
    if(user.hasOwnProperty('avatar') && !avatar){
        peoson.avatar = AVATAR
    }
    delete peoson.password
    return peoson
}

module.exports = {
    init_user
}