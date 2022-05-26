/**
 * @description Server User
 */
const { Op } = require('sequelize')

const { User, Follow, Blog } = require('../db/model')
const hash = require('../utils/crypto')
const { init_4_user } = require('../utils/init')

const create = async (data) => {
    let { password } = data
    password = hash(password)
    var data = { ...data, password }
    //  user: User Ins
    const user = await User.create({ ...data, password })
    //console.log('@user => ', user)
    //  follow_self : [ Follow Ins ]
    const follow_self = await user.addIdol(user)
    //console.log('@follow_self => ', follow_self)
    return user
    return init_4_user(user.dataValues)
}

const read = async ({ id, email, password }) => {
    const data = {}
    if (id) data.id = id
    if (email) data.email = email
    if (password) data.password = hash(password)
    const user = await User.findOne({ where: data })
    if (!user) return {}
    return init_4_user(user.dataValues)
}

const update = async (newUserInfo, id) => {
    if (newUserInfo.password) {
        newUserInfo.password = hash(newUserInfo.password)
    }
    let [row] = await User.update(newUserInfo, {
        where: { id }
    })
    console.log('@row => ', row)
    if (!row) return false
    let { dataValues } = await User.findByPk(id)
    return init_4_user(dataValues)
}

async function readFans(idol_id) {
    const idol = await User.findByPk(idol_id)
    const fans = await idol.getFans({
        attributes: ['id', 'email', 'nickname', 'avatar', 'avatar_hash']
    })
    if (!fans.length) return []
    return fans.map(({ dataValues }) => init_4_user(dataValues))
}

async function readNews(idol_id) {
    let res = (await User.findOne({
        where: { id: idol_id },
        include: [
            {
                model: User,
                as: 'Fans',
                through: {
                    where: {
                        confirm: false,
                        fans_id: { [Op.ne]: idol_id }
                    },
                    attributes: ['createdAt']
                }
            }, {
                model: User,
                as: 'Idol',
                attributes: ['email', 'nickname'],
                through: {
                    where: {
                        idol_id: { [Op.ne]: idol_id }
                    },
                },
                include: {
                    model: Blog,
                    attributes: ['id', 'title', 'createdAt']
                }
            }
        ]
    })).toJSON()
    console.log('@res => ', res)
    let { Fans, Idol} = res

    let fans = Fans.length ? Fans.map( fans => {
        return { data: {...init_4_user(fans), createdAt: fans.Follow.createdAt}, type: 'fans' }
    }) : []

    
    let idols_blogs = []
    if(Idol.length && Idol[0].Blogs.length){
        Idol.map( idol => {
            idol = init_4_user(idol)
            idol.Blogs.forEach( ({id, title, createdAt}) => {
                let res = {
                    data: {
                        blog: { id, title },
                        idol,
                        createdAt
                    },
                    type: 'idol_blog'
                }
                idols_blogs.push(res)
            })
        })
    }
    
    return [ ...fans, ...idols_blogs]
    
}

async function readIdols(fans_id) {
    const fan = await User.findByPk(fans_id)
    const idols = await fan.getIdol({
        attributes: ['id', 'email', 'nickname', 'avatar', 'avatar_hash']
    })
    if (!idols.length) return []
    return idols.map(({ dataValues }) => init_4_user(dataValues))
}

async function hasFans(idol_id, id) {
    const idol = await User.findByPk(idol_id)
    const res = await idol.hasFans(id)
    return res
}

async function addFans(idol_id, fans_id) {
    const idol = await User.findByPk(idol_id)
    const res = await idol.addFans(fans_id, { through: { comfirm: false } })
    //  成功 => [ follow, ... ]
    //  失敗 => undefined
    if (!res) return false
    const [item] = res.map(({ dataValues }) => dataValues)
    return { id: item.id, fans_id: item.fans_id, idol_id: item.idol_id }
}

async function deleteFans(idol_id, fans_id) {
    const idol = await User.findByPk(idol_id)
    const row = await idol.removeFans(fans_id)
    if (!row) return false
    return true
}

async function updateFollow(where, data) {
    const [row] = await Follow.update(data, { where })
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
    readNews,
    updateFollow
}