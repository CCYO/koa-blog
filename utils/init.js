/**
 * @description 數據格式化
 */

const { USER: { AVATAR }} = require('../conf/constant')

const init_4_user = (user) => {
    const { username, nickname, avatar } = user
    if(!nickname) user.nickname = username
    if(!avatar) user.avatar = AVATAR
    delete user.password
    return user
}

module.exports = {
    init_4_user
}