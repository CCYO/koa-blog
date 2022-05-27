/**
 * @description 數據格式化
 */

const { USER: { AVATAR }} = require('../conf/constant')

const _init_4_user = ( user ) => {
    const { email, nickname, avatar } = user
    if(!nickname){
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        user.nickname = target
    }
    if(!avatar) user.avatar = AVATAR
    delete user.password
    return user
}

const init_4_user = (user) => {
    return (user instanceof Array) ? user.map(_init_4_user) : _init_4_user(user)
}

module.exports = {
    init_4_user
}