const {
    User, Blog, Img, BlogImg, Blog_Fans
} = require('../db/model')

const { init_4_user } = require('../utils/init')

async function createBlog(title, user_id){
    const author = await User.findByPk(user_id)
    let blog = ( await author.createBlog({ title, user_id}) ).toJSON()
    return blog
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

    blogList = blogList.map( item => {
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

async function readBlog(blog_id) {
    let blog = await Blog.findByPk(blog_id, {
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
        blog = { 
            id: blog.id,
            title: blog.title,
            html: blog.html,
            show: blog.show,
            showAt: blog.showAt,
            imgs: blog.Imgs,
            user: blog.User.dataValues.id
        }
    }
    return blog
}

async function updateFollowBlog(where, data) {
    console.log('@data => ', data)
    console.log('@where => ', where)
    const [row] = await Blog_Fans.update(data, { where })
    console.log('@row => ', row)
    return row
}

module.exports = {
    createBlog,

    readBlogsByUserId,
    readBlog,
    updateFollowBlog
}
