/**
 * @description Server User
 */
const { Op } = require('sequelize')

const { NEWS } = require('../conf/constant')

const {
    User,
    Blog
} = require('../db/mysql/model')

const hash = require('../utils/crypto')

const { init_user } = require('../utils/init')

/** 查找 User 資料
 * @param {{ id: number, email: string, password: string }} param0 
 * @param {number} param0.id - user id
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @return {} 無資料為null，反之，password 以外的 user 資料
 */
async function readUser({ id, email, password }){
    const where = {}
    if (id) where.id = id
    if (email) where.email = email
    if (password) where.password = hash(password)

    const user = await User.findOne({ where })
    
    if (!user) return null
    
    return init_user(user)
}

/** 創建 User
 * @param {object} param0
 * @param {string} param0.email - user email
 * @param {string} param0.password - user 未加密的密碼
 * @returns {object} object 除了 password 以外的 user 資料
 */
const createUser = async ({ password, ...data }) => {
    let _data = { ...data }
    _data.password = hash(password)
    
    const user = await User.create(_data)
    return init_user(user)
}

/**
 * 查找 Fans，藉由 user_id
 * @param {string} idol_id 
 * @returns {array} arrItem 代表 fans，若數組為空，表示沒粉絲
 */
async function readFansByUserId(idol_id) {
    const idol = await User.findByPk(idol_id)

    const fansList = await idol.getFollowPeople_F({
        attributes: ['id', 'email', 'age', 'nickname', 'avatar', 'avatar_hash']
    })

    if (!fansList.length) return []
    return init_user(fansList)
}

/**
 * 查找 Idols，藉由 user_id
 * @param {string} fans_id 
 * @returns {array} arrItem 代表 idol，若數組為空，表示沒偶像
 */
async function readIdolsByUserId(fans_id) {
    const fans = await User.findByPk(fans_id)

    const idolList = await fans.getFollowPeople_I({
        attributes: ['id', 'email', 'age', 'nickname', 'avatar', 'avatar_hash']
    })

    if (!idolList.length) return []
    return init_user(idolList)
}

/**
 * 新增 Follow_People 紀錄
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {object|false} 成功 {id, fans_id, idol_id}，失敗 false
 */
async function addFans(idol_id, fans_id) {
    const idol = await User.findByPk(idol_id)
    const res = await idol.addFollowPeople_F(fans_id)
    //  成功 => [ follow, ... ]
    //  失敗 => undefined
    if (!res) return false
    const [item] = res.map(({ dataValues }) => dataValues)

    return {
        id: item.id,
        fans_id: item.fans_id,
        idol_id: item.idol_id
    }
}

/**
 * 刪除 Follow_People 紀錄
 * @param {number} idol_id idol id
 * @param {number} fans_id fans id
 * @returns {boolean} 成功 true，失敗 false
 */
async function deleteFans(idol_id, fans_id) {
    const idol = await User.findByPk(idol_id)
    const row = await idol.removeFollowPeople_F(fans_id)
    if (!row) return false
    return true
}









const update = async (newUserInfo, id) => {
    if (newUserInfo.password) {
        newUserInfo.password = hash(newUserInfo.password)
    }

    let [row] = await User.update(newUserInfo, {
        where: { id }
    })
    
    if (!row) return false
    let user = (await User.findByPk(id)).toJSON()
    return init_user(user)
}




//---


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
        user: init_user(user),
        blogs,
        fans: init_user(fans),
        idols: init_user(idols)
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

    

    author = init_user(author)

    return { author, blogList }
}

async function readUserAndFollowReationByUserId(user_id) {
    let _user = await User.findByPk(user_id)
    let _idols = await _user.getIdol()
    let _fans = await _user.getFans()

    _idols = init_user(_idols, user_id)
    _fans = init_user(_fans, user_id)

    let [user, fans, idols] = [_user, _fans, _idols].map(init_user)

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
            author: init_user(author),
            ...blog
        }
    })
}

async function readNews(id, index = 0) {
    let offset = index * NEWS.LIMIT
    let count = 0

    let blogList = await Blog_Fans.findAndCountAll({
        where: { fans_id: id },
        attributes: ['confirm', 'id'],
        include: {
            model: Blog,
            attributes: ['id', 'title', 'showAt'],
            where: { show: true },
            include: {
                model: User,
                attributes: ['id', 'email', 'nickname']
            }
        },
        order: [[Blog, 'showAt', 'DESC']],
        limit: NEWS.LIMIT,
        offset
    })

    count += await Blog_Fans.count({
        where: {
            confirm: false,
            fans_id: id
        },
        include: {
            model: Blog,
            where: { show: true }
        }
    })

    let news = { confirm: [], unconfirm: [] }

    blogList.rows.forEach(({ id: news_id, confirm, Blog: { id: blog_id, title, showAt, User: author } }) => {
        let data = {
            news_id,
            confirm,
            showAt,
            blog_id,
            title,
            author: init_user(author.toJSON())
        }
        if (confirm) {
            news.confirm.push(data)
        } else {
            news.unconfirm.push(data)
        }
    })

    let fansList = await Follow.findAndCountAll({
        where: {
            idol_id: id,
            fans_id: { [Op.ne]: id },
        },
        attributes: ['id', 'createdAt', 'confirm'],
        include: {
            model: User,
            as: 'Fans_of_Follow',
            attributes: ['id', 'email', 'nickname']
        },
        order: [['createdAt', 'DESC']],
        limit: NEWS.LIMIT,
        offset
    })

    fansList.rows.forEach(fans => {
        let { id: news_id, confirm, createdAt: showAt, Fans_of_Follow: user } = fans.toJSON()
        let { id: fans_id, nickname } = init_user(user)
        let data = {
            news_id,
            confirm,
            showAt,
            fans_id,
            nickname
        }
        if (confirm) {
            news.confirm.push(data)
        } else {
            news.unconfirm.push(data)
        }
    })

    count += await Follow.count({
        where: {
            confirm: false,
            idol_id: id,
            fans_id: { [Op.ne]: id }
        }
    })

    let more =
        index === 0 && (blogList.count > NEWS.LIMIT || fansList.count > NEWS.LIMIT) ? true :
            index > 0 && (blogList.count - NEWS.LIMIT > offset || fansList.count - NEWS.LIMIT > offset) ? true : false

    return {
        news,
        count,
        more
    }

}

async function readMoreNewsAndConfirm(id, index = 0, _checkTime, window_news_count) {
    let offset = index * NEWS.LIMIT
    let checkTime = new Date(_checkTime.time)
    let whereOps_blog = { fans_id: id }
    let whereOps_fans = {
        idol_id: id,
        fans_id: { [Op.ne]: id },
        createdAt: {
            [Op.lte]: checkTime
        }
    }
    if (_checkTime.type === 'blog') {
        whereOps_blog.id = {
            [Op.ne]: _checkTime.id
        }
    } else if (_checkTime.type === 'fans') {
        whereOps_fans.id = {
            [Op.ne]: _checkTime.id
        }
    }
    /* 查詢 早於checkTime 的 部分news */

    //  早於 checkTime 的 blog news
    let blogs = await Blog_Fans.findAndCountAll({
        where: whereOps_blog,
        attributes: ['confirm', 'id'],
        include: {
            model: Blog,
            attributes: ['id', 'title', 'showAt'],
            where: {
                show: true,
                showAt: {
                    [Op.lte]: checkTime
                }
            },
            include: {
                model: User,
                attributes: ['id', 'email', 'nickname']
            }
        },
        order: [[Blog, 'showAt', 'DESC']],
        limit: NEWS.LIMIT,
        offset
    })

    //  早於 checkTime 的 fans news
    let fans = await Follow.findAndCountAll({
        where: whereOps_fans,
        attributes: ['id', 'createdAt', 'confirm'],
        include: {
            model: User,
            as: 'Fans_of_Follow',
            attributes: ['id', 'email', 'nickname']
        },
        order: [['createdAt', 'DESC']],
        limit: NEWS.LIMIT,
        offset
    })

    /* 整理 撈取到的news*/
    let news = { confirm: [], unconfirm: [] }

    //  整理 blog news，且一併 confirm 未確認過的
    blogs.rows.forEach(async (blog) => {
        let {
            id: news_id,
            confirm,
            Blog: {
                id: blog_id,
                title,
                showAt,
                User: user
            }
        } = blog

        let { id, nickname } = init_user(user)

        let data = {
            news_id, confirm, showAt, blog_id, title, author: { id, nickname }
        }

        if (confirm) {
            news.confirm.push(data)
        } else {
            news.unconfirm.push(data)
            await blog.update({ confirm: true })
        }
    })

    //  整理 fans news，且一併 confirm 未確認過的
    fans.rows.forEach(async (item) => {
        let {
            id: news_id,
            confirm,
            createdAt: showAt,
            Fans_of_Follow: user
        } = item.toJSON()

        let { id: fans_id, nickname } = init_user(user)

        let data = { news_id, confirm, showAt, fans_id, nickname }

        if (confirm) {
            news.confirm.push(data)
        } else {
            news.unconfirm.push(data)
            await item.update({ confirm: true })
        }
    })

    //  還能不能 readMore
    let more =
        index === 0 && (blogs.count > NEWS.LIMIT || fans.count > NEWS.LIMIT) ? true :
            index > 0 && (blogs.count - NEWS.LIMIT > offset || fans.count - NEWS.LIMIT > offset) ? true : false

    /* 查詢 晚於checkTime 的 news */
    let blogNews = await Blog_Fans.findAndCountAll({
        where: {
            fans_id: id,
            confirm: false
        },
        attributes: ['id'],
        include: {
            model: Blog,
            attributes: ['id', 'title', 'showAt'],
            where: {
                show: true,
                showAt: {
                    [Op.gt]: checkTime
                }
            },
            include: {
                model: User,
                attributes: ['id', 'email', 'nickname']
            }
        },
        order: [[Blog, 'showAt', 'DESC']],
        limit: NEWS.LIMIT,
        offset: 0
    })

    let fansNews = await Follow.findAndCountAll({
        where: {
            idol_id: id,
            confirm: false,
            fans_id: { [Op.ne]: id },
            createdAt: {
                [Op.gt]: checkTime
            }
        },
        attributes: ['id', 'createdAt'],
        include: {
            model: User,
            as: 'Fans_of_Follow',
            attributes: ['id', 'email', 'nickname']
        },
        order: [['createdAt', 'DESC']],
        limit: NEWS.LIMIT,
        offset: 0
    })

    let new_news = { news: [], count: blogNews.count + fansNews.count }

    //  假如無 晚於checkTime 的 news，或是與前端傳來的 new_news_count 同數目，則不用繼續處理
    if (!new_news.news.count || new_news.news.count == window_news_count) {
        return { news, more, new_news }
    }

    blogNews.rows.forEach(blog => {
        let {
            id: news_id,
            confirm,
            Blog: {
                id: blog_id,
                title,
                showAt,
                User: user
            }
        } = blog

        let { id, nickname } = init_user(user)

        let data = {
            news_id, confirm, showAt, blog_id, title, author: { id, nickname }
        }

        if (confirm) {
            new_news.news.push(data)
        } else {
            new_news.news.push(data)
        }
    })

    fansNews.rows.forEach(fans => {
        let {
            id: news_id,
            confirm,
            createdAt: showAt,
            Fans_of_Follow: user
        } = fans.toJSON()

        let { id: fans_id, nickname } = init_user(user)

        let data = { news_id, confirm, showAt, fans_id, nickname }

        if (confirm) {
            new_news.news.push(data)
        } else {
            new_news.news.push(data)
        }
    })

    if (new_news.news.length) {
        new_news.count = blogNews.count + fansNews.count
    }

    return { news, more, new_news }
}

async function updateFollow(where, data) {
    const [row] = await Follow.update(data, { where })
    return row
}

async function confirmNews(user_id, time) {
    let blog_fans = await Blog_Fans.findAll({
        attributes: ['id'],
        where: {
            confirm: false,
            fans_id: user_id,
            createdAt: { [Op.lte]: new Date(time) },
        },
        include: {
            model: Blog,
            where: {
                show: true
            },
            attributes: []
        }
    })
    blog_fans = blog_fans.map(item => item.toJSON().id)

    await Blog_Fans.update(
        {
            confirm: true
        },
        {
            where: { id: blog_fans }
        }
    )

    await Follow.update({ confirm: true }, {
        where: {
            idol_id: user_id,
            fans_id: { [Op.ne]: user_id },
            confirm: false
        },
        attributes: ['fans_id']
    })
    return true
}

async function UnconfirmNewsCount(id, time) {
    let checkTime = new Date(time)
    let blogNews = await Blog_Fans.findAndCountAll({
        where: {
            fans_id: id,
            confirm: false,
            attribute: []
        },
        include: {
            model: Blog,
            where: {
                show: true,
                showAt: { [Op.gt]: checkTime }
            },
            attributes: []
        }
    })
    let fansNews = await Follow.findAndCountAll({
        where: {
            idol_id: id,
            confirm: false,
            createdAt: { [Op.gt]: checkTime },
            fans_id: { [Op.ne]: id }
        },
        attributes: []
    })

    return blogNews.count + fansNews.count
}

module.exports = {
    createUser,
    readUser,
    readFansByUserId,
    readIdolsByUserId,

    update,

    addFans,
    deleteFans,
    readNews,
    updateFollow,

    readOther,

    readBlogListAndAuthorByUserId,
    readUserAndFollowReationByUserId,
    confirmNews,
    UnconfirmNewsCount,
    readMoreNewsAndConfirm
}