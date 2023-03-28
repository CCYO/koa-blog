
const { Op } = require('sequelize')
const { hash } = require('../utils/crypto')   //  0228

const {
    User,
    Img,
    Blog,
    BlogImg,
    BlogImgAlt
} = require('../db/mysql/model')

const BLOGIMGALT = {
    modify: ({id, alt}) => ({
        data: { alt },
        opts: {
            where: { id }
        }
    }),
    count: (blogImg_id) => ({
        attributes: ['id'],
        where: { blogImg_id }  
    })
}
const IMG = {
    findImgThenEditBlog: (hash) => ({
        attributes: ['id', 'url', 'hash'],
        where: { hash }
    })
}
const BLOG = {
    //  0324
    findBlogsForUserPage: (author_id) => ({
        attributes: ['id', 'title', 'show', 'showAt', 'updatedAt'],
        where: { user_id: author_id }
    }),
    //  0228
    findBlog: ({ blog_id, author_id }) => {
        let where = {}
        if (blog_id) {
            where.id = blog_id
        }
        if (author_id) {
            where.user_id = author_id
        }
        return {
            attributes: ['id', 'title', 'html', 'show', 'showAt', 'updatedAt'],
            where,
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'email', 'nickname']
                },
                {
                    model: BlogImg,
                    attributes: [[ 'id', 'blogImg_id'], 'name'],
                    include: [
                        {
                            model: Img,
                            attributes: [['id', 'img_id'], 'url', 'hash']
                        },
                        {
                            model: BlogImgAlt,
                            attributes: ['id', 'alt']
                        }
                    ]
                }
            ]
        }
    },

    // findBlogsByFollowShip: ({ idol_id, fans_id }) => ({
    //     attributes: ['id'],
    //     where: {
    //         user_id: idol_id
    //     },
    //     include: {
    //         model: User,
    //         as: 'FollowBlog_F',
    //         attributes: [],
    //         where: { id: fans_id }
    //     }
    // })
}

const FOLLOWCOMMENT = {
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

const COMMENT = {
    findBlogsOfCommented: (commenter_id) => ({
        attributes: ['blog_id'],
        where: {
            user_id: commenter_id
        },
        paranoid: false
    }),
    findCommentForNews: (comment_id) => ({
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
    }),
    findBlogCommentsRelatedPid: ({ blog_id, p_id }) => {
        //  找尋指定 blogId
        let where = { blog_id }
        //  根評論，找同樣是 pid = null 的根評論即可
        if (!p_id) {
            where.p_id = null
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
            association: 'author',
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

const FOLLOWBLOG = {

}




const FOLLOWPEOPLE = {

}

//  0228
const USER = {
    findArticleReaderByIdolFans: ({ idolId, fansId }) => ({
        attributes: ['id'],
        where: { id: idolId },
        include: {
            association: 'fans',
            attributes: ['id'],
            where: {
                id: fansId
            },
            through: {
                attributes: [],
                paranoid: false
            },
            include: {
                attributes: ['id'],
                association: 'FollowBlog_B',
                where: { user_id: idolId },
                through: {
                    attributes: ['id'],
                    paranoid: false
                }
            }
        }
    }),
    //  0304
    findIdols: (fans_id) => {
        return {
            attributes: ['id'],
            where: { id: fans_id },
            include: {
                association: 'idols',
                attributes: ['id', 'email', 'nickname', 'avatar'],
                through: {
                    attributes: []
                }
            }
        }
    },
    //  0228
    findFans: (idol_id) => {
        return {
            attributes: ['id'],
            where: { id: idol_id },
            include: {
                association: 'fans',
                attributes: ['id', 'email', 'nickname', 'avatar'],
                through: {
                    attributes: []
                }
            }
        }
    },
    //  0228
    findUser: (id) => {
        return {
            attributes: ['id', 'email', 'nickname', 'avatar'],
            where: { id }
        }
    },
    login: ({ email, password: pwd }) => {
        let password = hash(pwd)
        return {
            attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash'],
            where: { email, password }
        }
    },
    //  0323
    isEmailExist: (email) => {
        return {
            attributes: ['id'],
            where: { email }
        }
    }
}

module.exports = {
    BLOGIMGALT,     //  0326
    IMG,            //  0326
    BLOG,
    USER,           //0323

    FOLLOWCOMMENT,
    COMMENT,
    FOLLOWPEOPLE,
    FOLLOWBLOG,

    findPublicBlogListByExcludeId,    //  0303
    findBlogFollowersByBlogId,  //  0303

}