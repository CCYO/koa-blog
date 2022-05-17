/**
 * @description 數據格式化
 */

const { USER: { AVATAR }} = require('../conf/constant')

const init_4_user = (user) => {
    const { email, nickname, avatar, avatar_hash } = user
    if(!nickname){
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        user.nickname = target
    }
    if(!avatar) user.avatar = AVATAR
    delete user.password
    return user
}

module.exports = {
    init_4_user
}