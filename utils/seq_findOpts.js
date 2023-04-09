const {
    //  0409
    Img,
    //  0409
    BlogImg,
    //  0409
    BlogImgAlt,
    Comment,
    User,
} = require('../db/mysql/model')
const { hash } = require('../utils/crypto')   //  0228
module.exports = {
    //  0408
    BLOG_IMG_ALT: {
        //  0409
        find: (alt_id) => ({
            where: { id: alt_id },
            attributes: [['id', 'alt_id'], 'alt'],
            include: {
                model: BlogImg,
                attributes: [['id', 'blogImg_id'], 'name', 'blog_id', 'img_id'],
            }
        }),
        //  0408
        count: (blogImg_id) => ({
            where: { blogImg_id }
        }),
        modify: ({ id, alt }) => ({
            data: { alt },
            opts: {
                where: { id }
            }
        }),
    },
    //  0404
    BLOG: {
        //  0406
        findInfoForSubscribe: (article_id) => ({
            attribute: ['id', 'show'],
            where: { id: article_id },
            include: [
                {
                    association: 'readers',
                    attributes: ['id'],
                    through: {
                        attributes: ['id'],
                        paranoid: false
                    }
                },
                {
                    association: 'author',
                    attribute: ['id'],
                    include: {
                        association: 'fansList',
                        attributes: ['id']
                    }
                },
            ]
        }),
        //  0404
        findWholeInfo: (id) => ({
            attributes: ['id', 'title', 'html', 'show', 'showAt', 'updatedAt'],
            where: { id },
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
                            attributes: [['id', 'alt_id'], 'alt']
                        }
                    ]
                }
            ]
        }),
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
    //  0404
    USER: {
        //  0406
        findInfoForFollowIdol: ({ idol_id, fans_id }) => ({
            attributes: ['id'],
            where: { id: fans_id },
            include: [
                {
                    association: 'idols',
                    attributes: ['id'],
                    where: { id: idol_id },
                    required: false,
                    through: {
                        attributes: ['id'],
                        paranoid: false
                    }
                },
                {
                    association: 'articles',
                    attributes: ['id'],
                    where: { author_id: idol_id },
                    required: false,
                    through: {
                        attributes: ['id'],
                        paranoid: false
                    }
                }
            ]
        }),
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
    //  0406
    IMG: {
        find: (hash) => ({
            attributes: ['id', 'url', 'hash'],
            where: { hash }
        })
    },
    //  0406
    FOLLOW: {
        //  0406
        removeList: (id_list) => ({
            where: { id: { [Op.in]: id_list } }
        }),
        //  0406
        restoreList: (id_list) => ({
            where: { id: { [Op.in]: id_list } }
        }),
    },
    //  0404
    COMMENT: {
        //  0404
        findRelativeUnconfirmList: ({ pid, article_id, createdAt }) => ({
            attributes: ['id'],
            where: {
                article_id,
                pid: pid === 0 ? null : pid,
                createdAt: { [Op.gt]: createdAt }
            },
            include: {
                association: 'commenter',
                attributes: ['id', 'email', 'nickname'],
            }
        }),
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
    ARTICLE_READER: {
        count: (blog_id) => ({
            where: { blog_id }
        })
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

const { Op } = require('sequelize')
const { fastFormats } = require('ajv-formats/dist/formats')
