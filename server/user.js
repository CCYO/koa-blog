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
            indclude: {
                model: 'Blog',
                attributes: ['id', 'title', 'showAt', 'updatedAt', 'createdAt']
            }
        }
    )
    let {
        Blogs: blogs,
        ...author
    } = res.json()
    return { author, blogs }
}

async function readFollowReationByUserId(user_id, onlyNewFans = false) {
    let through = {
        attributes: ['confirm']
    }
    if (onlyNewFans === true) {
        through.where = { comfirm: false }
    }
    let res = await User.findByPk(
        userid,
        {
            include: [
                {
                    model: User,
                    as: 'Fans',
                    attributes: ['id', 'email', 'nickname'],
                    where: {
                        id: { [Op.ne]: user_id }
                    },
                    through
                },
                {
                    model: User,
                    as: 'Idol',
                    attributes: ['id', 'email', 'nickname'],
                    where: {
                        id: { [Op.ne]: user_id }
                    }
                }
            ]
        }
    )

    let {
        Fans: fans,
        Idol: idol,
        ...user
    } = res.toJSON()
    

    fans = fans.map( ( _fans ) => {
        _fans.confirm = _fans.Follow.confirm 
        delete _fans.Follow
    })

    return [user, fans, idol].map( init_4_user )
}

async function readBlogListOfIdeoByUserId(user_id, onlyNewBlogs = true, includeSelfBlogs = false){
    let through = {
        attributes: [],
        where: {
            confirm: false
        }
    }

    if(onlyNewBlogs === false){
        delete through.where
    }

    let where = {
        id: { [Op.ne]: user_id }
    }
    
    if(includeSelfBlogs === true){
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
    let blogs = Blogs.map( ({ User: author, ...blog}) => {
        return {
            author: init_4_user(author),
            ...blog
        }
    })
}

async function readNews(id) {
    let res = await User.findOne({
        where: { id },
        include:
            [
                {
                    model: Blog,
                    attributes: ['id', 'title', 'show', 'showAt', 'createdAt']
                },
                {
                    model: User,
                    as: 'Fans',
                    attributes: ['id', 'email', 'nickname'],
                    through: {
                        where: {
                            confirm: false,
                            fans_id: { [Op.ne]: id }
                        },
                        attributes: ['createdAt']
                    }
                },
                {
                    model: Blog,
                    as: 'BlogNews',
                    through: {
                        where: {
                            confirm: false
                        }
                    },
                    include: {
                        model: User,
                        attributes: ['id', 'nickname', 'email']
                    }
                }
            ]
    })



    let {
        Blogs,
        Fans: fansNews,
        BlogNews: blogNews,
        ...user
    } = res.toJSON()

    let json = res.toJSON()

    console.log('@json => ', json)

    //  處理 blogs
    let blogs = { show: [], hidden: [] }

    Blogs.length && Blogs.forEach((blog) => {
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
        blogs,
        news: [blogNews, ...fansNews]
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