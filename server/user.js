/**
 * @description Server User
 */
const { User } = require('../db/model')
const { init_4_user } = require('../utils/init')

const create = async (data) => {    
    const { dataValues } = await User.create(data)
    return init_4_user(dataValues)
}

const read = async ({username, password}) => {
    const data = { username }
    if(password) data.password = hash(password)
    const user = await User.findOne({ where: data})
    if(!user) return false
    return init_4_user(user.dataValues)
}

module.exports = {
    create,
    read
}