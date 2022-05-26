const {
    User, Blog, Img, BlogImg
} = require('../db/model')

const { init_4_user } = require('../utils/init')

async function readBlogList(user_id) {
    let blogs = await Blog.findAll({
        attributes: ['id', 'title', 'show'],
        where: { '$User.id$': user_id },
        include: {
            model: User,
            attributes: ['id', 'nickname', 'email', 'age', 'avatar'],
        }
    })

    if (!blogs.length) return []

    blogs = blogs.map(({
        dataValues: {
            id, title, show,
            User: { dataValues: user_dataValues}
        } }) => ({ id, title, show, user: init_4_user(user_dataValues) })
    )
    return blogs
}

async function readBlog(blog_id) {
    let blog = await Blog.findByPk(blog_id, {
        attributes: ['id', 'title', 'html'],
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
    if (blog) {
        blog.Imgs = blog.Imgs.map(({
            dataValues: {
                id: img_id, url, hash,
                BlogImg: {
                    dataValues: {
                        id: blogImg_id, name
                    }
                }
            }
        }) => {
            return { img_id, url, hash, blogImg_id, name }
        })
        blog = { id: blog.id, title: blog.title, html: blog.html, imgs: blog.Imgs, user: blog.User.dataValues.id }
    }
    return blog
}

module.exports = {
    readBlogList,
    readBlog
}
