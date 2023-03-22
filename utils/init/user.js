/**
 * @description 數據格式化
 */

const { init } = require('mysql2/typings/mysql/lib/Connection')
const { USER: { AVATAR } } = require('../../conf/constant')

function go(user){
    if(Array.isArray(user)){
        return init_users(user)
    }else{
        return init_user(user)
    }
}

function init_user(user) {
    if (!user) {
        return null
    }
    return init(user)
}

function init_users(users) {
    if (!users.length) {
        return []
    }
    return users.map( user => init_user(user) )
}

function init(user) {
    let json = user.toJSON
    const { email, nickname, avatar } = json

    if (!nickname && email) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        json.nickname = target
    }
    if (json.hasOwnProperty('avatar') && !avatar) {
        json.avatar = AVATAR
    }
    delete json.password
    return json
}

module.exports = {
    init_user
}