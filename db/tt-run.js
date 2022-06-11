const { Op } = require('sequelize')

const {
    User, Blog, Img, BlogImg, Follow, Blog_Fans, seq
} = require('./model')

const { create } = require('../server/user')

async function init() {
    let user1 = await create({ email: '1@gmail.com', password: '123456' })
    let user2 = await create({ email: '2@gmail.com', password: '123456' })
    let user3 = await create({ email: '3@gmail.com', password: '123456' })
    let user4 = await create({ email: '4@gmail.com', password: '123456' })

    await user1.addFan([user2, user3, user4])
    await user2.addFan([user1, user3, user4])
    await user3.addFan([user1, user2, user4])
    await user4.addFan([user1, user2, user3])

    let b1 = await Blog.create({user_id: 1, title: '1st of 1', showAt: new Date(), show: true})
    let b2 = await Blog.create({user_id: 1, title: '2st of 1', showAt: new Date(), show: true})
    let b3 = await Blog.create({user_id: 2, title: '1st of 2', showAt: new Date(), show: true})
    let b4 = await Blog.create({user_id: 2, title: '2st of 2', showAt: new Date(), show: true})
    let b5 = await Blog.create({user_id: 3, title: '1st of 3', showAt: new Date(), show: true})
    let b6 = await Blog.create({user_id: 3, title: '2st of 3', showAt: new Date(), show: true})
    let b7 = await Blog.create({user_id: 4, title: '1st of 4', showAt: new Date(), show: true})
    let b8 = await Blog.create({user_id: 4, title: '2st of 4', showAt: new Date(), show: true})

    await b1.addFollower([user2, user3, user4])
    await b2.addFollower([user2, user3, user4])
    await b3.addFollower([user1, user3, user4])
    await b4.addFollower([user1, user3, user4])
    await b5.addFollower([user1, user2, user4])
    await b6.addFollower([user1, user2, user4])
    await b7.addFollower([user1, user2, user3])
    await b8.addFollower([user1, user2, user3])

    console.log('@ok')
}

async function go2(user_id, time) {
    
}


(
    async () => {
        try {
            let res = await init()
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()