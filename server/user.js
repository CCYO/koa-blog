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



async function readIdols(fans_id) {
    const fan = await User.findByPk(fans_id)
    const idols = await fan.getIdol({
        attributes: ['id', 'email', 'nickname', 'avatar', 'avatar_hash']
    })
    if (!idols.length) return []
    return idols.map(({ dataValues }) => init_4_user(dataValues))
}

async function deleteFans(idol_id, fans_id) {
    const idol = await User.findByPk(idol_id)
    const row = await idol.removeFans(fans_id)
    if (!row) return false
    return true
}




async function readOther(other_id) {
    let other = await User.findOne({
        where: { id: other_id },
        include: [
            {
                model: Blog,
                attributes: ['id', 'title', 'createdAt', 'updatedAt']
            },
            {
                model: User,
                as: 'Idol',
                through: {
                    where: {
                        idol_id: { [Op.ne]: other_id }
                    }
                }
            },
            {
                model: User,
                as: 'Fans',
                through: {
                    where: {
                        fans_id: { [Op.ne]: other_id }
                    }
                }
            }
        ]
    })
    let {
        Blogs: blogs,
        Fans: fans,
        Idol: idols,
        ...user
    } = other.toJSON()

    return {
        user: init_4_user(user),
        blogs,
        fans: init_4_user(fans),
        idols: init_4_user(idols)
    }
}


//---
async function addFans(idol_id, fans_id) {
    const idol = await User.findByPk(idol_id)
    const res = await idol.addFans(fans_id, { through: { comfirm: false } })
    //  成功 => [ follow, ... ]
    //  失敗 => undefined
    if (!res) return false
    const [item] = res.map(({ dataValues }) => dataValues)
    return { id: item.id, fans_id: item.fans_id, idol_id: item.idol_id }
}

async function readNews(id) {
    console.log(3)
    let res = await User.findOne({
        where: { id },
        include: [
            {
                model: Blog,
                attributes: ['id', 'title', 'show', 'showAt', 'createAt']
            },
            // {
            //     model: User,
            //     as: 'Fans',
            //     attributes: ['id', 'email', 'nickname'],
            //     through: {
            //         where: {
            //             confirm: false,
            //             fans_id: { [Op.ne]: id }
            //         },
            //         attributes: ['createdAt']
            //     }
            // },
            // {
            //     model: Blog,
            //     as: 'BlogNews',
            //     through: {
            //         where: {
            //             confirm: false
            //         }
            //     },
            //     include: {
            //         model: User,
            //         attributes: ['id', 'nickname', 'email']
            //     }
            // }
        ]
    })

    

    // let {
    //     Blogs,
    //     Fans: fansNews,
    //     BlogNews: blogNews,
    //     ...user
    // } = res.toJSON()

    let json = res.toJSON()

    console.log('@json => ', json)

    //  處理 blogs
    let blogs = { show: [], hidden: []}

    Blogs.length && Blogs.forEach( (blog) => {
        blog.show && blogs.show.push(blog)
        !blog.show && blogs.hidden.push(blog)
    })

    //  新追蹤的fans
    fansNews = fansNews.length ? fansNews.map(fans => ({
        data: {
            ...init_4_user(fans),
            showAt: fans.Follow.createdAt,
        },
        type: 'fans'
    })) : []

    //  處理 idol 的 blogNews
    blogNews =
        (blogNews.length) ?
            blogNews.map(blog => {
                let { User: user } = blog
                let author = init_4_user(user)
                return {
                    type: 'blogNews',
                    data: {
                        id, title, showAt, author
                    }
                }
            }) :
            []

    //  處理 user
    user = init_4_user(user)

    return { 
        user, 
        blogNews,
        news : [ ...blogs, ...fansNews ]
    }

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
    addFans,
    deleteFans,
    readIdols,
    readNews,
    updateFollow,

    readOther
}