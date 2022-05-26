const { Op } = require('sequelize')

const {
    User, Blog, Img, BlogImg, Follow, seq
} = require('./model')

const { create } = require('../server/user')

async function go() {
    let user1 = await create({ email: '1@gmail.com', password: '123456' })
    let user2 = await create({ email: '2@gmail.com', password: '123456' })
    let user3 = await create({ email: '3@gmail.com', password: '123456' })

    await user1.addFan([user2, user3])
    console.log('@ok')
}

(
    async () => {
        try {
            go()
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()