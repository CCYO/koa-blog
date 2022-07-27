const {
    User, Blog, Img, BlogImg, Blog_Fans
} = require('../db/model')

const { init_4_user} = require('../utils/init/user')

/**
 * 創建Blog，並與User作關聯
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function createBlogAndAssociateWidthUser(title, user_id) {
    let blog = await Blog.create({ title, user_id })
    await blog.setUser(user_id)
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
async function readBlogById(blog_id) {
    let res = await Blog.findByPk(blog_id, {
        attributes: ['id', 'title', 'html', 'show', 'showAt'],
        include: [
            {
                model: Img,
                attributes: ['id', 'url', 'hash'],
                through: {
                    model: BlogImg,
                    attributes: ['id', 'name']
                }
            },
            User
        ]
    })

    if (!res) {
        return null
    }

    let {
        Img: imgList,
        User: author,
        ...blog
    } = res.toJSON()

    let data = { ...blog, imgs: [], author: {} }

    if (imgList && imgList.length) {
        imgList.forEach(
            ({
                BlogImg: {
                    id: blogImg_id, name
                },
                ...img
            }) => { data.imgs.push({ ...img, blogImg_id, name }) }
        )
    }

    data.author = init_4_user(author)

    return data
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
async function readBlogList({ user_id, getAll = false}) {
    let where = { user_id}

    if(!getAll){
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

    let data = {show: [], hidden: []}

    if (!blogList.length) return []

    blogList = blogList.map(item => {
        let { User: author, ...blog } = item.toJSON()
        return { ...blog, author: init_4_user(author) }
    } )

    return blogList
}

module.exports = {
    createBlogAndAssociateWidthUser,
    updateBlog,
    cancelAssociateWidthImg,
    deleteBlog,
    readBlogById,
    readBlogList
}
