const { Op } = require('sequelize')

const {
    seq,
    User,
    Blog,
    Img,
    Comment,
    BlogImg
} = require('../db/mysql/model')

const {
    init_blog
} = require('../utils/init')

/** 創建Blog
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function createBlog({ title, user_id }) {
    let blog = await Blog.create({ title, user_id })

    //  為 blog 創建一個 作者的留言，且 pid = id
    // let comment = await blog.createComment({ user_id })
    // comment = await comment.update({ p_id: comment.id })

    //  讓作者追蹤這份(↑)自己的留言，且標示為 comfirm
    // let follow = await comment.addFollowComment_F(user_id, { through: { confirm: true } })

    return init_blog(blog)
}

/** 刪除 blog
 * 
 * @param {number} blog_id 
 * @returns {number} 0 代表失敗，1 代表成功
 */
async function deleteBlog(blog_id) {
    let row = await Blog.destroy({ where: { id: blog_id } })
    if (!row) {
        return false
    }
    return true
}

/** 更新blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {number} 1代表更新成功，0代表失敗
 */
async function updateBlog(blog_id, newData) {
    let [row] = await Blog.update(newData, {
        where: { id: blog_id }
    })

    return row
}

/**批量刪除
 * 
 * @param {*} blog_id 
 * @param {*} needComment 
 * @returns 
 */
async function deleteBlogs({ blogList_id }) {
    let [{affectedRows}] = await seq.getQueryInterface().bulkDelete('Blogs', {
        id: { [Op.in]: blogList_id }
    })
    
    if(affectedRows !== blogList_id.length ){
        return false
    }
    return true
}

/** 查找 blog 紀錄
 * 
 * @param {number} blog_id 
 * @returns {object|null} 
 *  若有找到
 *      blog {
 *          id, title, html, show, showAt,
 *          imgs: [ { blogImg_id, name, id, url, hash }, ... ],
 *          author: { id, email, nickname, age, avatar, avatar_hash }
 *      }
 *  ，若找不到則 null
 */
async function readBlog({ blog_id }, needComment) {
    let include = [
        {
            model: User,
            attributes: ['id', 'email', 'nickname']
        },
        {
            model: Img,
            attributes: ['id', 'url', 'hash'],
            through: {
                model: BlogImg,
                attributes: ['id', 'name']
            }
        }
    ]

    if (needComment) {
        include.push({
            model: Comment,
            attributes: ['id', 'html', 'p_id', 'createdAt'],
            include: {
                model: User,
                attributes: ['id', 'email', 'nickname']
            }
        })
    }
    let res = await Blog.findByPk(blog_id, {
        attributes: ['id', 'title', 'html', 'show', 'showAt'],
        include
    })

    if (!res) {
        return null
    }

    return init_blog(res)
}

/** 查詢 blogList
 * @param {object} param0 查詢 blogs 紀錄所需的參數
 * @param {number} param0.user_id user id
 * @param {boolean} param0.getAll 是否無視 blog 公開/隱藏，false 僅拿公開，true 全拿
 * @returns {object} 
 *  [blog: {
 *      id, title, show, showAt,
 *      author: { id, email, nickname, age, avatar, avatar_hash }
 *  }]
 * 
 
 */
async function readBlogList({ user_id, follower_id, allBlogs = false }) {
    let where = { user_id }
    let include = [{
        model: User,
        attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash']
    }]

    if (!allBlogs) {
        where.show = true
    }

    if (follower_id) {
        include.push({
            model: User,
            as: 'FollowBlog_F',
            attributes: [],
            where: { id: follower_id }
        })
    }

    let blogList = await Blog.findAll({
        attributes: ['id', 'title', 'show', 'showAt'],
        where,
        include
    })

    return init_blog(blogList)
}

module.exports = {
    createBlog,
    updateBlog,
    deleteBlog,
    deleteBlogs,
    readBlog,
    readBlogList
}
