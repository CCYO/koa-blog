const { Op } = require('sequelize')

const {
    User, Blog, Img, BlogImg, FollowPeople, Blog_Follow, Comment, News, seq
} = require('./model')

const {
    createUser,
    addFans
} = require('../server/user')
const { readImgAndAssociateWidthBlog } = require('../server/img')
const { createBlogAndAssociateWidthUser } = require('../server/blog')

const {
    getFansById
} = require('../controller/user')

const {
    addBlog,
    modifyBlog,
    removeBlog,
    getBlog
} = require('../controller/blog')

const {
    confirmNews,
    getNewsByUserId,

    readMoreByUserIdAndTime
} = require('../controller/news')

const { 
    FollowBlog,
    readNews,
} = require('../server/news')

async function init() {
    let associateToNews = []
    let user1 = await create({ email: '1@gmail.com', password: '123456' })
    let user2 = await create({ email: '2@gmail.com', password: '123456' })
    let user3 = await create({ email: '3@gmail.com', password: '123456' })
    let user4 = await create({ email: '4@gmail.com', password: '123456' })

    let user_follow_1 = await user1.addFan([user2, user3, user4])
    let user_follow_2 = await user2.addFan([user1, user3, user4])
    let user_follow_3 = await user3.addFan([user1, user2, user4])
    let user_follow_4 = await user4.addFan([user1, user2, user3])

    let b1 = await Blog.create({ user_id: 1, title: '1st of 1', show: true })
    let b2 = await Blog.create({ user_id: 1, title: '2st of 1', show: true })
    let b3 = await Blog.create({ user_id: 2, title: '1st of 2', show: true })
    let b4 = await Blog.create({ user_id: 2, title: '2st of 2', show: true })
    let b5 = await Blog.create({ user_id: 3, title: '1st of 3', show: true })
    let b6 = await Blog.create({ user_id: 3, title: '2st of 3', show: true })
    let b7 = await Blog.create({ user_id: 4, title: '1st of 4', show: true })
    let b8 = await Blog.create({ user_id: 4, title: '2st of 4', show: true })

    let blog_follow_1 = await b1.addBlog_of_Blog_Follow([user2, user3, user4])
    let blog_follow_2 = await b2.addBlog_of_Blog_Follow([user2, user3, user4])
    let blog_follow_3 = await b3.addBlog_of_Blog_Follow([user1, user3, user4])
    let blog_follow_4 = await b4.addBlog_of_Blog_Follow([user1, user3, user4])
    let blog_follow_5 = await b5.addBlog_of_Blog_Follow([user1, user2, user4])
    let blog_follow_6 = await b6.addBlog_of_Blog_Follow([user1, user2, user4])
    let blog_follow_7 = await b7.addBlog_of_Blog_Follow([user1, user2, user3])
    let blog_follow_8 = await b8.addBlog_of_Blog_Follow([user1, user2, user3])

    associateToNews.push(...user_follow_1, ...user_follow_2, ...user_follow_3, ...user_follow_4)
    associateToNews.forEach(async item => await item.createNews({ type: 1, showAt: new Date() }))

    associateToNews = []
    associateToNews.push(...blog_follow_1, ...blog_follow_2, ...blog_follow_3, ...blog_follow_4, ...blog_follow_5, ...blog_follow_6, ...blog_follow_7, ...blog_follow_8)
    associateToNews.forEach(async item => await item.createNews({ type: 2, showAt: new Date() }))
    // let new1 = await user_follow_1.createNews({ type: 1, showAt: new Date()})
    // let new2 = await user_follow_2.createNews({ type: 1, showAt: new Date()})
    // let new3 = await user_follow_3.createNews({ type: 1, showAt: new Date()})
    // let new4 = await user_follow_4.createNews({ type: 1, showAt: new Date()})

    // let new5 = await blog_follow_5.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new6 = await blog_follow_6.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new7 = await blog_follow_7.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new8 = await blog_follow_8.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new9 = await blog_follow_9.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new10 = await blog_follow_10.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new11 = await blog_follow_11.forEach( follow.createNews({ type: 2, showAt: new Date()}))
    // let new12 = await blog_follow_12.forEach( follow.createNews({ type: 2, showAt: new Date()}))

    console.log('@ok')
}

async function go2(user_id, time) {
    const { id: img_id } = (await Img.create({
        url: '123456',
        hash: '789000',
    })).toJSON()

    const { id: blog_id } = (await createBlogAndAssociateWidthUser('test', 1)).toJSON()
    await readImgAndAssociateWidthBlog({ id: img_id }, blog_id)
    console.log('ok')
}

(
    async () => {
        try {
            // await seq.sync({ force: true })
            
             const { errno, data, msg } = await confirmNews({ people: [5,7], blogs: [3,5,9,11,13]})

            // await Comment.truncate()
            // let { errno, data, msg} = await getBlog(2, true)

            if(errno){
                console.log('@msg => ', msg)
                return
            }
            console.log('@@data => ', data)
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()