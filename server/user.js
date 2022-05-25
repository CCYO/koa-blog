/**
 * @description Server User
 */
const { User, Follow } = require('../db/model')
const hash = require('../utils/crypto')
const { init_4_user } = require('../utils/init')

const create = async (data) => {    
    let { password } = data
    password = hash(password)
    var data = {...data, password}
    const { dataValues } = await User.create({...data, password})
    return init_4_user(dataValues)
}

const read = async ({id, email, password}) => {
    const data = { }
    if(id) data.id = id
    if(email) data.email = email
    if(password) data.password = hash(password)
    const user = await User.findOne({ where: data})
    if(!user) return {}
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

async function readFans(idol_id){
    const idol = await User.findByPk(idol_id)
    const fans = await idol.getFans({
        attributes: ['id', 'email', 'nickname', 'avatar', 'avatar_hash']
    })
    if(!fans.length) return []
    return fans.map( ({ dataValues }) => init_4_user( dataValues ) )
}

async function getNewFans(idol_id){
    let res = await User.findOne({
        where: { id: idol_id },
        include: {
            model: User,
            as: 'Fans',
            through: {
                where: { confirm: false },
                //attributes: ['createdAt']
            }
        }
    })
    let fans = res.toJSON().Fans
    if(fans.length) return fans.map( fan => {
        return { data: { ...init_4_user(fan), createdAt: fan.Follow.createdAt }, type: 'fans' }
    })
    return []
}

async function readIdols(fans_id){
    const fan = await User.findByPk(fans_id)
    const idols = await fan.getIdol({
        attributes: ['id', 'email', 'nickname', 'avatar', 'avatar_hash']
    })
    if(!idols.length) return []
    return idols.map( ({ dataValues }) => init_4_user( dataValues ) )
}

async function hasFans(idol_id, id){
    const idol = await User.findByPk(idol_id)
    const res = await idol.hasFans(id)
    return res
}

async function addFans(idol_id, fans_id){
    const idol = await User.findByPk(idol_id)
    const res = await idol.addFans(fans_id, { through: { comfirm: false}})
    //  成功 => [ follow, ... ]
    //  失敗 => undefined
    if(!res) return false
    const [ item ] = res.map( ( {dataValues} ) => dataValues )
    return { id: item.id, fans_id: item.fans_id, idol_id: item.idol_id }
}

async function deleteFans(idol_id, fans_id){
    const idol = await User.findByPk(idol_id)
    const row = await idol.removeFans(fans_id)
    if(!row) return false
    return true
}

async function updateFollow(where, data){
    const [row] = await Follow.update(data, {where})
    return row
}

module.exports = {
    create,
    read,
    update,
    readFans,
    hasFans,
    addFans,
    deleteFans,
    readIdols,
    getNewFans,
    updateFollow
}