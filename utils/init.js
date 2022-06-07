/**
 * @description 數據格式化
 */

const { USER: { AVATAR } } = require('../conf/constant')

const _init_4_user = (user, id = undefined) => {
    if(id && user.dataValues && user.dataValues.id === id){
        return null
    }
    let peoson = user.toJSON ? user.toJSON() : user
    const { email, nickname, avatar, age } = peoson
    if (!nickname) {
        let regex = /^([\w]+)@/
        let [_, target] = regex.exec(email)
        peoson.nickname = target
    }
    if (!avatar) peoson.avatar = AVATAR
    delete peoson.password
    return peoson
}

const init_4_user = (people, id) => {
    if (people instanceof Array) {
        let res = []
        people.forEach( user => {
            let _user = _init_4_user(user, id)
            _user && res.push(_user)
        })
        return res
    } 
    return _init_4_user(people)
}

module.exports = {
    init_4_user
}