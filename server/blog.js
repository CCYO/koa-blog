const {
    User, Blog, Img, BlogImg, Blog_Fans
} = require('../db/model')

const { init_4_user } = require('../utils/init')

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
    console.log('@row => ', row)
    return row
}

/**
 * 刪除 blog
 * @param {number} blog_id 
 * @returns {number} 0 代表失敗，1 代表成功
 */
async function deleteBlog(blog_id){
    return await Blog.destroy({ where: { id: blog_id }})
    
}

/**
 * 
 * @param {number} blog_id 
 * @returns {object|null} 
 *      若有找到 blog，RV {
 *          id, title, html, show, showAt,
 *          imgs: [ { blogImg_id, name, id, url, hash }, ... ],
 *          author: { id, email, nickname, age, avatar, avatar_hash }
 *      }, 若找不到則 null
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
            }) => { data.imgs.push({ ...img, blogImg_id, name })}
        )
    }

    data.author = init_4_user(author)

    return data
}



async function readBlogsByUserId(user_id) {
    let blogList = await Blog.findAll({
        attributes: ['id', 'title', 'show', 'showAt'],
        where: { '$User.id$': user_id },
        include: {
            model: User,
            attributes: ['id', 'email', 'nickname', 'age', 'avatar', 'avatar_hash']
        }
    })

    if (!blogList.length) return []

    blogList = blogList.map(item => {
        item = item.toJSON()
        let { User: author, ...blog } = item
        author = init_4_user(author)
        console.log('@author => ', author)
        console.log('@blog => ', blog)
        return { blog, author }
    })

    console.log('@blogList => ', blogList)
    return blogList
    //     ({
    //     dataValues: {
    //         id, title, show,
    //         User: { dataValues: user_dataValues }
    //     } }) => ({ id, title, show, user: init_4_user(user_dataValues) })
    // )
    // return blogs
}

async function updateFollowBlog(where, data) {
    console.log('@data => ', data)
    console.log('@where => ', where)
    const [row] = await Blog_Fans.update(data, { where })
    console.log('@row => ', row)
    return row
}

module.exports = {
    createBlogAndAssociateWidthUser,
    updateBlog,
    cancelAssociateWidthImg,
    deleteBlog,
    readBlogById,


    readBlogsByUserId,
    updateFollowBlog
}
