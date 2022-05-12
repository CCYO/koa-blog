const {
    User, Blog, Img, BlogImg
} = require('../db/model')

async function readBlogList(user_id) {
    let blogs = await Blog.findAll({
        attributes: ['id', 'title'],
        where: { '$User.id$': user_id },
        include: {
            model: User,
            attribute: [],
        }
    })
    if (blogs.length) {
        blogs = blogs.map(({
            dataValues: {
                id, title,
            } }) => ({ id, title })
        )
    }
    return blogs
}

async function readBlog(blog_id) {
    let blog = await Blog.findByPk(blog_id, {
        attributes: ['id', 'title', 'html'],
        include: {
            model: Img,
            attributes: ['id', 'url', 'hash'],
            through: {
                model: BlogImg,
                attributes: ['id', 'name']
            }
        }
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
        blog = { id: blog.id, title: blog.title, html: blog.html, imgs: blog.Imgs }
    }
    return blog 
}

module.exports = {
    readBlogList,
    readBlog
}
