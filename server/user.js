/**
 * @description Server User
 */
const { User } = require('../db/model')
const hash = require('../utils/crypto')
const { init_4_user } = require('../utils/init')

const create = async (data) => {    
    let { password } = data
    password = hash(password)
    var data = {...data, password}
    const { dataValues } = await User.create({...data, password})
    return init_4_user(dataValues)
}

const read = async ({email, password}) => {
    const data = { email }
    if(password) data.password = hash(password)
    console.log('@data => ', data)
    const user = await User.findOne({ where: data})
    console.log('@user => ', user)
    if(!user) return false
    return init_4_user(user.dataValues)
}

const update = async (newUserInfo, id) => {
    if(newUserInfo.password){
        newUserInfo.password = hash(newUserInfo.password)
    }
    let [ row ] = await User.update( newUserInfo, {
        where: { id }
    })
    console.log('@row => ', row)
    if(!row) return false
    let { dataValues } = await User.findByPk(id)
    return init_4_user(dataValues)
}

module.exports = {
    create,
    read,
    update
}