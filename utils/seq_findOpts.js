const { hash } = require('../utils/crypto')   //  0228

const {
    User,
    Img,
    BlogImg,
    BlogImgAlt
} = require('../db/mysql/model')

//  0228
function findBlog({blog_id, author_id}) {
    let where = {}
    if(blog_id){
        where.id = blog_id
    }
    if(author_id){
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
function findCommentsByBlogId(blog_id) {
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

//  0228
function findFans(idol_id) {
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
function findUser(user_id) {
    return {
        attributes: ['id', 'email', 'nickname', 'avatar'],
        where: { id: user_id }
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







function findComment(comment_id) {
    return {
        attributes: ['id', 'html', 'updatedAt', 'createdAt', 'deletedAt', 'p_id'],
        where: { id: comment_id },
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'nickname']
            },
            {
                model: Blog,
                attributes: ['id', 'title'],
                include: {
                    model: User,
                    attributes: ['nickname', 'id']
                }
            }
        ]
    }
}
module.exports = {
    
    findComment,

    findBlog,//  0228
    findCommentsByBlogId,       //  0228
    findBlogsByFollowerShip,    //  0228
    findBlogListByAuthorId,     //  0228
    findUser,                   //  0228
    findIdols,                  //  0228
    findFans,                   //  0228
    login,                      //  0228
    findUserByEmail,            //  0228
}