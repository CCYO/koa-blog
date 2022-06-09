/**
 * @description Server User
 */
const { Op } = require('sequelize')

const { NEWS } = require('../conf/constant')

const { User, Follow, Blog, Blog_Fans } = require('../db/model')
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


//  user, blogs
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

async function readBlogListAndAuthorByUserId(user_id) {
    let res = await User.findByPk(
        user_id,
        {
            include: {
                model: Blog,
                attributes: ['id', 'title', 'show', 'showAt', 'updatedAt', 'createdAt']
            }
        }
    )


    let {
        Blogs: blogList,
        ...author
    } = res.toJSON()

    console.log('@bbbb => ', blogList)

    author = init_4_user(author)

    return { author, blogList }
}

async function readUserAndFollowReationByUserId(user_id) {
    let _user = await User.findByPk(user_id)
    let _idols = await _user.getIdol()
    let _fans = await _user.getFans()

    _idols = init_4_user(_idols, user_id)
    _fans = init_4_user(_fans, user_id)

    let [user, fans, idols] = [_user, _fans, _idols].map(init_4_user)

    return { user, fans, idols }

}

async function readBlogListOfIdeoByUserId(user_id, onlyNewBlogs = true, includeSelfBlogs = false) {
    let through = {
        attributes: [],
        where: {
            confirm: false
        }
    }

    if (onlyNewBlogs === false) {
        delete through.where
    }

    let where = {
        id: { [Op.ne]: user_id }
    }

    if (includeSelfBlogs === true) {
        delete where.id
    }

    let res = await findByPk(
        user_id,
        {
            attributes: [],
            include: {
                model: 'Blog',
                as: 'BlogNews',
                attributes: ['id', 'title', 'showAt'],
                through,
                include: {
                    model: User,
                    attributes: ['id', 'email', 'nickname'],
                    where
                }
            }
        }
    )

    let { Blogs } = res.toJSON()
    let blogs = Blogs.map(({ User: author, ...blog }) => {
        return {
            author: init_4_user(author),
            ...blog
        }
    })
}

async function readNews(id, index) {
    let offset = index * NEWS.LIMIT
    let blogList = await Blog_Fans.findAndCountAll({
        where: { fans_id: id, confirm: false },
        attributes: [],
        include: {
            model: Blog,
            attributes: ['id', 'title', 'showAt'],
            where: { show: true },
            include: {
                model: User,
                attributes: ['id', 'email', 'nickname']
            }
        },
        limit: NEWS.LIMIT,
        offset
    })

    let blogNews = []
    blogList.rows.forEach(({ Blog: { id, title, showAt, User: author } }) => {
        blogNews.push({
            type: 'blogNews',
            data: {
                id,
                title,
                showAt,
                author: init_4_user(author.toJSON())
            }
        })
    })

    let fansList = await Follow.findAndCountAll({
        where: {
            idol_id: id,
            fans_id: { [Op.ne]: id },
            confirm: false
        },
        attributes: ['createdAt'],
        include: {
            model: User,
            as: 'Fans_of_Follow',
            attributes: ['id', 'email', 'nickname']
        },
        limit: NEWS.LIMIT,
        offset
    })

    let fansNews = []
    fansList.rows.forEach(fans => {
        let { createdAt: showAt, Fans_of_Follow: user } = fans.toJSON()
        let { id, nickname } = init_4_user(user)
        console.log('@user => ', fans.toJSON())
        fansNews.push({
            type: 'fans',
            data: { showAt, id, nickname }
        })
    })

    console.log('@index => ', index)
    console.log('@blogList.count => ', blogList.count)
    console.log('@fansList.count => ', fansList.count)
    console.log('@offset => ', offset)

    let more =
        index === 0 && (blogList.count > NEWS.LIMIT || fansList.count > NEWS.LIMIT) ? true :
        index > 0 && (blogList.count - NEWS.LIMIT > offset || fansList.count - NEWS.LIMIT > offset) ? true : false

    console.log('@more => ', more)
    return { news: [...blogNews, ...fansNews], more, count: blogList.count + fansList.count }

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

    readOther,

    readBlogListAndAuthorByUserId,
    readUserAndFollowReationByUserId
}