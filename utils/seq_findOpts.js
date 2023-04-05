const { hash } = require('../utils/crypto')   //  0228
module.exports = {
    //  0404
    COMMENT: {
        //  0404
        findWholeInfo: (id) => ({
            attributes: ['id', 'html', 'updatedAt', 'createdAt', 'deletedAt', 'pid'],
            where: { id },
            include: [
                {
                    association: 'commenter',
                    attributes: ['id', 'email', 'nickname'],
                },
                {
                    association: 'article',
                    attributes: ['id', 'title'],
                    include: {
                        association: 'author',
                        attributes: ['id', 'email', 'nickname']
                    }
                }
            ]
        }),
        findBlogsOfCommented: (commenter_id) => ({
            attributes: ['blog_id'],
            where: {
                user_id: commenter_id
            },
            paranoid: false
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
                include: {
                    model: User,
                    attributes: ['id', 'email', 'nickname']
                }
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
    },
    //  0404
    BLOG: {
        //  0404
        findWholeInfo: (opts) => {
            let pairs = Object.entries(opts)
            let where = {}
            for (let [prop, val] of pairs) {
                where[prop] = val
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
                        attributes: [['id', 'blogImg_id'], 'name'],
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
        //  0404
        find: (id) => ({
            attributes: ['id', 'title', 'html', 'show', 'showAt', 'updatedAt'],
            where: { id },
            include: {
                association: 'author',
                attributes: ['id', 'email', 'nickname']
            },
        }),
        //  0404
        findListForUserPage: (author_id) => ({
            attributes: ['id', 'title', 'show', 'showAt', 'updatedAt'],
            where: { author_id }
        }),
        findBlogsHasPhoto: (user_id) => ({
            attributes: ['id', 'title', 'show', 'showAt', 'updatedAt'],
            where: { user_id },
            include: {
                model: BlogImg,
                attributes: [],
                required: true
            }
        })
    },
    USER: {
        //  0404
        findIdols: (fans_id) => ({
            attributes: ['id', 'email', 'nickname', 'avatar'],
            include: {
                association: 'fansList',
                where: { id: fans_id },
                through: {
                    attributes: [],
                }
            }
        }),
        //  0404
        findFansList: (idol_id) => ({
            attributes: ['id', 'email', 'nickname', 'avatar'],
            include: {
                association: 'idols',
                where: { id: idol_id },
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }
        }),
        //  0404
        find: (id) => {
            return {
                attributes: ['id', 'email', 'nickname', 'avatar'],
                where: { id }
            }
        },
        //  0404  
        login: ({ email, password }) => ({
            attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash'],
            where: {
                email,
                password: hash(password)
            }
        }),
        //  0404
        create: ({ email, password }) => ({
            email,
            password: hash(password)
        }),
        //  0404
        isEmailExist: (email) => {
            return {
                attributes: ['id'],
                where: { email }
            }
        },
        findOthersInSomeBlogAndPid: ({ commenter_id, p_id, blog_id, createdAt }) => {
            p_id = p_id ? p_id : 0
            return {
                attributes: ['id', 'email', 'nickname'],
                where: { id: { [Op.not]: commenter_id } },
                include: {
                    model: Comment,
                    attributes: ['id'],
                    where: {
                        p_id,
                        blog_id,
                        createdAt: { [Op.gt]: createdAt }
                    }
                }
            }
        },
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
        })
    },
    BLOGIMGALT: {
        modify: ({ id, alt }) => ({
            data: { alt },
            opts: {
                where: { id }
            }
        }),
        count: (blogImg_id) => ({
            attributes: ['id'],
            where: { blogImg_id }
        })
    },
    IMG: {
        findImgThenEditBlog: (hash) => ({
            attributes: ['id', 'url', 'hash'],
            where: { hash }
        })
    },
    PUB_SCR: {
        count: (blog_id) => ({
            where: { blog_id }
        })
    },
    FOLLOWCOMMENT: {
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
    },
    findPublicBlogListByExcludeId(exclude_id) {
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
    },
    //  0303
    findBlogFollowersByBlogId(blog_id) {
        return {
            attributes: ['follower_id'],
            where: { blog_id }
        }
    }
}

const {
    Comment,
    User,
    Img,
    Blog,
    BlogImg,
    BlogImgAlt,
} = require('../db/mysql/model')
const { Op } = require('sequelize')