const { Op } = require('sequelize')
const moment = require('moment')
const my_xxs = require('../utils/xss')

const {
    readFansByUserId
} = require('../server/user')

const {
    createBlog,
    updateBlog,
    cancelAssociateWidthImg,
    deleteBlog,
    readBlogById,
    readBlogList,
} = require('../server/blog')

const {
    FollowBlog: FB
} = require('../server/news')

const { SuccModel, ErrModel } = require('../model')
const { BLOG, FOLLOW } = require('../model/errRes')

/**
 * 建立 blog
 * @param { string } title 標題
 * @param { number } userId 使用者ID  
 * @returns SuccModel for { data: { id, title, html, show, showAt, createdAt, updatedAt }} || ErrModel
 */
async function addBlog(title, user_id) {
    try {
        title = my_xxs(title)
        const blog = await createBlog({title, user_id})
        return new SuccModel(blog)
    } catch (e) {
        return new ErrModel({ ...BLOG.CREATE_ERR, msg: e })
    }
}

/**
 * 更新 blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {object} SuccModel || ErrModel
 */
async function modifyBlog(blog_id, blog_data, author_id) {
    let { title, removeImgs, html, show } = blog_data
    let data = {}

    if (title) {
        data.title = my_xxs(title)
    }

    if (html) {
        data.html = my_xxs(html)
    }

    if (show > 0) {
        if (show === 1) {
            /* 初次公開，將文章與粉絲作關聯 */
            data.show = true

            //  取得粉絲群
            let followerList = await readFansByUserId(author_id)
            if (followerList.length) {
                //  取得粉絲群的id
                let followerList_id = followerList.map(({ id }) => id)
                //  將粉絲與文章作關聯
                await FB.createFollowers({ blog_id, followerList_id })
            }
            //  建立文章公開數據
            data.showAt = new Date()

        } else if (show === 2) {
            /*  公開過又隱藏 */
            data.show = false

            //  FollowBlog 軟刪除 confirm: false 的 粉絲
            await FB.hiddenBlog({ blog_id })

        } else if (show === 3) {
            //  不是第一次公開
            data.show = true

            let fansList_id = []
            //  FollowBlog 恢復軟刪除的 舊粉絲，通知新粉絲

            //  先篩出距離上次公開，這期間新增的粉絲

            //  restory 此 blog 的 FollowBlog.follower，且將這些follower取出
            // await FollowBlog.restoreBlog({ blog_id })
            let r = await FB.updateFB({ deletedAt: null, createdAt: new Date() }, {
                where: { blog_id, deletedAt: {[Op.not]: null}  }
            })

            let followerList_id = await FB.readFollowers({ blog_id })

            //  找出目前FollowPeople.fans
            let fansList = await readFansByUserId(author_id)
            if (fansList.length) {
                fansList.forEach(({ id }) => fansList_id.push(id))
            }

            //  篩去兩者重複的id
            let newFollowerList_Id = fansList_id.filter(fans_id => {
                return !followerList_id.includes(fans_id)
            })
            
            if (newFollowerList_Id.length) {
                //  新增FollowBlog.follower
                await FB.createFollowers({ blog_id, followerList_id: newFollowerList_Id })
            }

        }
    }

    if (removeImgs && removeImgs.length) {
        /* 若有值，則要刪除這些圖片的關聯 */
        let row = await cancelAssociateWidthImg(removeImgs)
        if (!row) {
            return new ErrModel(BLOG.IMAGE_REMOVE_ERR)
        }
    }

    let row = await updateBlog(blog_id, data)

    if (!row) {
        return new ErrModel(BLOG.NO_UPDATE)
    }

    return new SuccModel(data)
}

/**
 * 刪除 blog
 * @param {number} blog_id 
 * @returns {object} SuccModel || ErrModel
 */
async function removeBlog(blog_id) {
    const res = await deleteBlog(blog_id)
    if (res) return new SuccModel()
    return new ErrModel(BLOG.BLOG_REMOVE_ERR)
}

/**
 * 取得 blog 紀錄
 * @param {number} blog_id blog id
 * @returns 
 */
async function getBlog(blog_id, needComment = false) {
    const blog = await readBlogById(blog_id, needComment)
    
    if (blog) {
        return new SuccModel(blog)
    } else {
        return new ErrModel(BLOG.NOT_EXIST)
    }
}

/**
 * 藉 userId 取得 blogList
 * @param {number} user_id user id
 * @param {boolean} is_author 是否作者本人
 * @returns {object} SuccessModel
 * { 
 *  blogList { 
 *      show: [ 
 *          blog {
 *              id, title, showAt, 
 *              author: { id, email, nickname, age, avatar, avatar_hash }
 *          }, ...
 *      ],
 *      hidden: [ blog, ... ]
 *  } 
 * }
 */
async function getBlogListByUserId(user_id, is_author = false) {
    let param = { user_id }

    if (is_author) {
        param.allBlogs = true
    }

    let blogList = await readBlogList(param)

    let data = { show: [], hidden: [] }

    blogList.forEach(item => {
        let { show } = item
        delete item.show
        show && data.show.push(item)
        !show && data.hidden.push(item)
    })

    return new SuccModel(data)
}

module.exports = {
    addBlog,
    modifyBlog,
    removeBlog,
    getBlog,
    getBlogListByUserId
}