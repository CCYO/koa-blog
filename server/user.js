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
    const user = await User.findOne({ where: data})
    if(!user) return false
    return init_4_user(user.dataValues)
}

const update = async (newUserInfo ) => {
    let data = { ...newUserInfo }
    if(data.password){
        data.password = hash(data.password)
    }
    console.log(data)
    let user = await User.findOne({
        where: { id: data.id }
    })
    if(!user) return false
    await user.update(data)
    return init_4_user(user.dataValues)
}

module.exports = {
    create,
    read,
    update
}