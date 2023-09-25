//  0411
const { Op } = require('sequelize')
const {
    //  0409
    Img,
    //  0409
    BlogImg,
    //  0409
    BlogImgAlt,
    Comment,
    User,
    Blog,
} = require('../db/mysql/model')
const { hash } = require('../utils/crypto')   //  0228
module.exports = {
    //  0514
    ARTICLE_READER: {
        //  0514
        findReadersForModifiedUserData: (articles) => ({
            attributes: ['reader_id'],
            where: {
                article_id: { [Op.in]: articles}
            }
        }),
        count: (blog_id) => ({
            where: { blog_id }
        })
    },
    //  0429
    BLOG_IMG: {
        findInfoForRemoveBlog: (blog_id) => ({
            where: {
                blog_id
            },
            attributes: ['id']
        })
    },
    //  0404
    BLOG: {
        //  0427
        findInfoForModifyTitle: (blog_id) => ({
            where: { id: blog_id, /*show: true*/ },
            attributes: ['id'],
            include: [
                {
                    association: 'author',
                    attributes: ['id'],
                    include: {
                        association: 'fansList',
                        attributes: ['id']
                    }
                },
                {
                    association: 'readers',
                    attributes: ['id'],
                },
                {
                    association: 'replys',
                    attributes: ['id'],
                    required: false,
                    // where: {
                    //     deletedAt: { [Op.not]: null }
                    // },
                    include: {
                        association: 'receivers',
                        attributes: ['id'],
                        through: {
                            attributes: []
                        }
                    }
                }
            ]
        }),
        //  0406
        findInfoForHidden: (article_id, forDelete) => {
            let where = { id: article_id }
            //  不作為刪除 blog 使用時，判斷條件需加入 show: true
            if (!forDelete) {
                where.show = true
            }
            return {
                attributes: ['id'],
                where,
                include: [
                    {
                        association: 'author',
                        attributes: ['id']
                    },
                    {
                        association: 'readers',
                        attributes: ['id'],
                        through: {
                            attributes: ['id']
                        }
                    },
                    {
                        association: 'replys',
                        attributes: ['id'],
                        required: false,
                        // where: {
                        //     deletedAt: { [Op.not]: null }
                        // },
                        include: {
                            association: 'receivers',
                            attributes: ['id'],
                            through: {
                                attributes: ['id']
                            }
                        }
                    }
                ]
            }
        },
        //  0406
        findInfoForShow: (article_id) => ({
            attributes: ['id'],
            where: { id: article_id },
            include: [
                {
                    association: 'readers',
                    attributes: ['id'],
                    //  ArticleReader
                    through: {
                        attributes: ['id', 'article_id', 'reader_id', 'confirm', 'createdAt', 'deletedAt'],
                        paranoid: false
                    }
                },
                {
                    association: 'author',
                    attributes: ['id'],
                    include: {
                        association: 'fansList',
                        attributes: ['id']
                    }
                },
                {
                    association: 'replys',
                    required: false,
                    // where: { 
                    //     deletedAt: { [Op.not]: null }
                    // },
                    attributes: ['id'],
                    include: {
                        association: 'receivers',
                        attributes: ['id'],
                        //  MsgReceiver
                        through: {
                            attributes: ['id', 'msg_id', 'receiver_id', 'confirm', 'createdAt', 'deletedAt'],
                        }
                    }
                }
            ]
        }),
        //  0411
        findInfoForPageOfSquare() {
            return {
                attributes: ['id', 'title', 'show', 'showAt', 'createdAt'],
                where: {
                    show: true
                },
                include: {
                    association: 'author',
                    attributes: ['id', 'email', 'nickname']
                }
            }
        },
        //  0411
        findInfoForPageOfAlbumList: (author_id) => ({
            attributes: ['id', 'title', 'show', 'showAt', 'updatedAt', 'createdAt'],
            where: { author_id },
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'nickname', 'email'],
                    required: true
                }, {
                    model: BlogImg,
                    attributes: [],
                    required: true
                }
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
        findListForUserPage: (author_id, { limit = 5, offset = 0 }) => ({
            attributes: ['id', 'title', 'author_id', 'show', 'showAt', 'updatedAt'],
            where: { author_id }
        }),
        findPublicBlogForUserPage: (author_id, opts = { limit: 5, offset: 0 }) => ({
            attributes: ['id', 'title', 'author_id', 'show', 'showAt', 'updatedAt'],
            where: {
                author_id,
                show: true
            },
            limit: opts.limit,
            offset: opts.offset
        }),
        findPrivateBlogForUserPage: (author_id, opts = { limit: 5, offset: 0 }) => ({
            attributes: ['id', 'title', 'author_id', 'show', 'showAt', 'updatedAt'],
            where: {
                author_id,
                show: false
            },
            limit: opts.limit,
            offset: opts.offset
        })

    },
    //  0404
    COMMENT: {
        //  0514
        findArticlesOfCommented: (commenter_id) => ({
            attributes: ['id', 'article_id'],
            where: {
                commenter_id
            }
        }),
        //  0423
        _findUnconfirmListBeforeNews: ({ comment_id, pid, article_id, createdAt }) => ({
            attributes: ['id'],
            where: {
                id: { [Op.not]: comment_id },
                article_id,
                pid: pid === 0 ? null : pid,
                createdAt: { [Op.gte]: createdAt }
            },
            include: {
                association: 'commenter',
                attributes: ['id', 'email', 'nickname'],
            }
        }),
        //  0420
        _findMsgReceiverOfAuthor: ({ article_id, author_id }) => ({
            attributes: ['id'],
            where: { article_id },
            include: {
                association: 'receivers',
                attributes: ['id'],
                where: { id: author_id }
            }
        }),
        //  0411
        _findInfoAboutItem: ({ article_id, pid }) => {
            //  找尋指定 blogId
            let where = { article_id }
            //  根評論，找同樣是 pid = null 的根評論即可
            if (!pid) {
                where.pid = null
                //  子評論，找id=pid的父評論 and pid=pid 的兄弟評論
            } else {
                where[Op.or] = [{ id: pid }, { pid }]
            }
            return {
                attributes: ['id', 'commenter_id'],
                where,
                include: {
                    association: 'receivers',
                    attribute: ['id'],
                }
            }
        },
        //  0414
        _findLastItemOfPidAndNotSelf: (article_id, commenter_id, time, pid) => ({
            attributes: ['id', 'html', 'article_id', 'commenter_id', 'updatedAt', 'createdAt', 'deletedAt', 'pid'],
            where: {
                article_id,
                commenter_id: { [Op.not]: commenter_id },
                pid: pid ? pid : null,
                createdAt: { [Op.lte]: time }
            },
            order: [['createdAt', 'DESC']]
        }),
        //  0411
        findLastItemOfNotSelf: (article_id, commenter_id, time) => ({
            attributes: ['id', 'html', 'article_id', 'commenter_id', 'updatedAt', 'createdAt', 'deletedAt', 'pid'],
            where: {
                article_id,
                commenter_id: { [Op.not]: commenter_id },
                createdAt: { [Op.lte]: time }
            },
            order: [['createdAt', 'DESC']]
        }),
        //  0411
        find: (id) => ({
            attributes: ['id', 'html', 'updatedAt', 'createdAt', 'deletedAt', 'pid', 'article_id', 'commenter_id'],
            where: { id },
            include: [
                {
                    association: 'commenter',
                    attributes: ['id', 'email', 'nickname']
                },
                {
                    association: 'article',
                    attribute: ['id', 'author_id']
                }
            ]
        }),
        //  0411
        findInfoForPageOfBlog: (article_id) => {
            return {
                attributes: ['id', 'html', 'pid', 'createdAt', 'deletedAt'],
                where: { article_id },
                paranoid: false,    //  包含已軟刪除的條目
                include: {
                    association: 'commenter',
                    attributes: ['id', 'email', 'nickname']
                }
            }
        },
        //  0404
        findWholeInfo: (id) => ({
            attributes: ['id', 'html', 'article_id', 'updatedAt', 'createdAt', 'deletedAt', 'pid'],
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
        })
    },
    //  0411
    MSG_RECEIVER: {
        //  0514
        findListForModifiedUserData: (msgs) => ({
            attributes: ['receiver_id'],
            where: { msg_id: { [Op.in]: msgs } }
        }),
        //  0414
        findList: (msg_id) => ({
            where: { msg_id }
        }),
        //  0411
        bulkCreate: (datas) => {
            let keys = [...Object.keys(datas)]
            return {
                updateOnDuplicate: [...keys]
            }
        },
        //  0411
        find: (whereOps) => ({
            attributes: ['id', 'receiver_id', 'msg_id', 'confirm', 'deletedAt', 'createdAt'],
            where: { ...whereOps }
        })
    },
    //  0408
    BLOG_IMG_ALT: {
        //  0409
        find: (alt_id) => ({
            where: { id: alt_id },
            attributes: [['id', 'alt_id'], 'alt'],
            include: {
                model: BlogImg,
                attributes: [['id', 'blogImg_id'], 'blog_id', 'name'],
                required: true,
                include: {
                    model: Img,
                    attribute: [['id', 'img_id'], 'url', 'hash'],
                    required: true
                }
            }
        }),
        //  0408
        count: (blogImg_id) => ({
            where: { blogImg_id }
        }),
    },
    //  0404
    USER: {
        //  0421
        findAlbumListOfUser: (user_id) => ({
            where: { id: user_id },
            include: {
                // model: Blog,
                // as: 'blogs',
                association: 'blogs',
                attributes: ['id', 'title', 'show', 'showAt', 'updatedAt', 'createdAt'],
                include: {
                    model: BlogImg,
                    attributes: [],
                    required: true
                }
            }
        }),
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
                        paranoid: false
                    }
                },
                {
                    association: 'articles',
                    attributes: ['id'],
                    where: {
                        author_id: idol_id,
                        show: true
                    },
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
        //  0414
        forceRemove: (id_list) => ({
            where: { id: { [Op.in]: id_list } },
            force: true
        }),
        //  0406
        removeList: (id_list) => ({
            where: { id: { [Op.in]: id_list } }
        }),
        //  0406
        restoreList: (id_list) => ({
            where: { id: { [Op.in]: id_list } }
        }),
    },
    //  0303
    findBlogFollowersByBlogId(blog_id) {
        return {
            attributes: ['follower_id'],
            where: { blog_id }
        }
    }
}


