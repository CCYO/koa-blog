/**
 * @description 數據格式化
 */

const { USER: { AVATAR } } = require('../../conf/constant')

function init_user(user) {
    if(!user){
        return null
    }
    if (user instanceof Array) {
        let res = []

        user.forEach(item => {
            res.push(init_users(item))
        })

        return res
    }

    return init_users(user)
}

function init_users(user) {
    let json = user.toJSON ? user.toJSON() : user

    const { email, nickname, avatar } = json

    if (!nickname && email) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        json.nickname = target
    }
    if(json.hasOwnProperty('avatar') && !avatar){
        json.avatar = AVATAR
    }
    delete json.password
    return json
}

module.exports = {
    init_user
}