
const { Op } = require('sequelize')
const { hash } = require('../utils/crypto')   //  0228

const {
    User,
    Img,
    BlogImg,
    BlogImgAlt
} = require('../db/mysql/model')

let FollowComment = {
    findItems: ({ comment_ids }, { exclude }) => {
        let where = {
            comment_id: { [Op.in]: comment_ids }
        }
        if (exclude) {
            let kvPairs = Object.entries(exclude)
            for (let [key, val] of kvPairs) {
                where[key] = { [Op.notIn]: val }
            }
        }
        return {
            attributes: ['id', 'follower_id', 'comment_id'],
            where
        }
    }
}

let Comment = {
    findBlogCommentsRelatedPid: ({ blog_id, p_id }) => {
        //  找尋指定 blogId
        let where = { blog_id }
        //  根評論，找同樣是 pid = null 的根評論即可
        if (!p_id) {
            where.p_id = p_id
            //  子評論，找id=pid的父評論 and pid=pid 的兄弟評論
        } else {
            where[Op.or] = [{ id: p_id }, { p_id }]
        }
        return {
            attributes: ['id'],
            where,
            include: {
                model: User,
                attributes: ['id']
            }
        }
    },
    //  0309
    findCommentById: (comment_id) => {
        return {
            attributes: ['id', 'html', 'updatedAt', 'createdAt', 'deletedAt', 'p_id'],
            where: { id: comment_id },
            include: [
                {
                    model: User,
                    attributes: ['id', 'email', 'nickname']
                },
                // {
                //     model: Blog,
                //     attributes: ['id', 'title'],
                //     include: {
                //         model: User,
                //         attributes: ['nickname', 'id']
                //     }
                // }
            ]
        }
    },
    //  0228
    findCommentsByBlogId: (blog_id) => {
        return {
            attributes: ['id', 'html', 'p_id', 'createdAt', 'deletedAt'],
            where: { blog_id },
            paranoid: false,    //  包含已軟刪除的條目
            include: {
                model: User,
                attributes: ['id', 'email', 'nickname']
            }
        }
    }
}
//  0303
function findPublicBlogListByExcludeId(exclude_id) {
    return {
        attributes: ['id', 'title', 'show', 'showAt', 'createdAt'],
        where: {
            show: true,
            user_id: { [Op.not]: exclude_id }
        },
        include: {
            model: User,
            attributes: ['id', 'email', 'nickname']
        }
    }
}
//  0303
function findBlogFollowersByBlogId(blog_id) {
    return {
        attributes: ['follower_id'],
        where: { blog_id }
    }
}
//  0228
function findBlog({ blog_id, author_id }) {
    let where = {}
    if (blog_id) {
        where.id = blog_id
    }
    if (author_id) {
        where.user_id = author_id
    }
    return {
        attributes: ['id', 'title', 'html', 'show', 'showAt'],
        where,
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'nickname']
            },
            {
                model: BlogImg,
                attributes: ['id', 'name'],
                include: [
                    {
                        model: Img,
                        attributes: ['id', 'url', 'hash']
                    },
                    {
                        model: BlogImgAlt,
                        attributes: ['id', 'alt']
                    }
                ]
            }
        ]
    }
}

//  0228
function findBlogsByFollowerShip({ idol_id, fans_id }) {
    return {
        attributes: ['id'],
        where: {
            user_id: idol_id
        },
        include: {
            model: User,
            as: 'FollowBlog_F',
            attributes: [],
            where: { id: fans_id }
        }
    }
}

//  0228
function findBlogListByAuthorId(author_id) {
    return {
        attributes: ['id', 'title', 'show', 'showAt', 'createdAt'],
        where: { user_id: author_id }
    }
}

//  0228
function findIdols(fans_id) {
    return {
        attributes: ['id'],
        where: { id: fans_id },
        include: {
            association: 'FollowPeople_I',
            attributes: ['id', 'email', 'nickname', 'avatar'],
            through: {
                attributes: []
            }
        }
    }
}
//  0304
function findIdolsByFansId(fans_id) {
    return {
        attributes: ['id'],
        where: { id: fans_id },
        include: {
            association: 'FollowPeople_I',
            attributes: ['id', 'email', 'nickname', 'avatar'],
            through: {
                attributes: []
            }
        }
    }
}
//  0228
function findFansByIdolId(idol_id) {
    return {
        attributes: ['id'],
        where: { id: idol_id },
        include: {
            association: 'FollowPeople_F',
            attributes: ['id', 'email', 'nickname', 'avatar'],
            through: {
                attributes: []
            }
        }
    }
}

//  0228
function findUser(user) {
    let isLoginData = user.password ? true : false
    //  以 login 需求向 DB 讀取數據
    if (isLoginData) {
        let { password, email } = user
        password = hash(password)
        return {
            attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash'],
            where: { email, password }
        }
    }
    //  單純以 id 向 DB 讀取數據
    return {
        attributes: ['id', 'email', 'nickname', 'avatar'],
        where: { id: user }
    }
}

//  0228
function login({ email, password: pwd }) {
    let password = hash(pwd)
    return {
        attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash'],
        where: { email, password }
    }
}

//  0228
function findUserByEmail(email) {
    return {
        attributes: ['id'],
        where: { email }
    }
}

module.exports = {
    FollowComment,
    Comment,

    findPublicBlogListByExcludeId,    //  0303
    findBlogFollowersByBlogId,  //  0303
    findBlog,                   //  0228
    findBlogsByFollowerShip,    //  0228
    findBlogListByAuthorId,     //  0228
    findUser,                   //  0228
    findIdols,                  //  0228
    findIdolsByFansId,          //  0303
    findFansByIdolId,           //  0228
    login,                      //  0228
    findUserByEmail,            //  0228
}