const {
    User, Blog, Img, Comment, BlogImg, Blog_Fans, FollowComment
} = require('../db/model')

const { 
    init_user,
    init_blog
} = require('../utils/init')

/**
 * 創建Blog，其中會與作者作關聯，且建立一份作者自己的留言
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function createBlog({title, user_id}) {
    let blog = await Blog.create({ title, user_id })
    
    //  為 blog 創建一個 作者的留言，且 id = pid
    let comment = await blog.createComment({user_id})
    comment = await comment.update({p_id: comment.id})
    
    //  讓作者追蹤這份(↑)自己的留言，且標示為 comfirm
    await comment.addFollowComment_F(user_id, {through: {comfirm: true}})
    return blog
}

/**
 * 更新blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {number} 1代表更新成功，0代表失敗
 */
async function updateBlog(blog_id, blog_data) {
    let [row] = await Blog.update(blog_data, {
        where: { id: blog_id }
    })

    return row
}

/**
 * 刪除 BlogImg 關聯
 * @param {[number]} blogImgs [blogImg_id, ....]
 * @returns {number} 0 代表失敗，1+ 代表成功
 */
async function cancelAssociateWidthImg(blogImgs) {
    let row = await BlogImg.destroy({
        where: { id: blogImgs }
    })

    return row
}

/**
 * 刪除 blog
 * @param {number} blog_id 
 * @returns {number} 0 代表失敗，1 代表成功
 */
async function deleteBlog(blog_id) {
    return await Blog.destroy({ where: { id: blog_id } })

}

/**
 * 查找 blog 紀錄
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
async function readBlogById(blog_id, needComment) {
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
    if(needComment){
        include.push({
            model: Comment,
            attributes: ['html', 'updatedAt'],
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

/**
 * 
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
async function readBlogList({ user_id, getAll = false }) {
    let where = { user_id }

    if (!getAll) {
        where.show = true
    }

    let blogList = await Blog.findAll({
        attributes: ['id', 'title', 'show', 'showAt'],
        where,
        include: {
            model: User,
            attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash']
        }
    })

    let data = { show: [], hidden: [] }

    if (!blogList.length) return []

    blogList = blogList.map(item => {
        let { User: author, ...blog } = item.toJSON()
        return { ...blog, author: init_user(author) }
    })

    return blogList
}

module.exports = {
    createBlog,
    updateBlog,
    cancelAssociateWidthImg,
    deleteBlog,
    readBlogById,
    readBlogList
}
