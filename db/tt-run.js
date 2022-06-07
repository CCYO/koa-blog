const { Op } = require('sequelize')

const {
    User, Blog, Img, BlogImg, Follow, Blog_Fans, seq
} = require('./model')

const { readBlogListAndAuthorByUserId } = require('../server/user')

const { create } = require('../server/user')

let users = []
let blogs = []
for (let i = 0; i < 50; i++) {
    let user = { email: `${i}@gmail.com`, password: '123456' }
    let blog = [
        { title: `${i} - 1st title`, user_id: `${i}`, html: '<p>內文</p>' },
        { title: `${i} - 2st title`, user_id: `${i}`, html: '<p>內文</p>' },
        { title: `${i} - 3st title`, user_id: `${i}`, html: '<p>內文</p>' }
    ]
    users.push(user)
    blogs.push(blog)
}

async function init(users, blogs) {
    await User.bulkCreate(users)
    await Blog.bulkCreate(blogs)
}

async function go() {
    let user1 = await create({ email: '1@gmail.com', password: '123456' })
    let user2 = await create({ email: '2@gmail.com', password: '123456' })
    let user3 = await create({ email: '3@gmail.com', password: '123456' })

    await user1.addFan([user2, user3])
    console.log('@ok')
}

async function go2() {
    let res = await Blog.findByPk(2, {
        include: {
            model: Img,
            where: { id: 1}
        }
    })
    console.log('@res => ', res)
}


(
    async () => {
        try {
            await go2()
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()