const { Op } = require('sequelize')

const {
    User, Blog, Img, BlogImg, Follow ,seq
} = require('./model')

const { create } = require('../server/user')

let users = []
let blogs = []
for(let i = 0; i < 50 ;i++){
    let user = { email: `${i}@gmail.com`, password: '123456'}
    let blog = [
        { title: `${i} - 1st title`, user_id: `${i}`, html: '<p>內文</p>'},
        { title: `${i} - 2st title`, user_id: `${i}`, html: '<p>內文</p>'},
        { title: `${i} - 3st title`, user_id: `${i}`, html: '<p>內文</p>'}
    ]
    users.push(user)
    blogs.push(blog)
}

async function init(users, blogs){
    await User.bulkCreate(users)
    await Blog.bulkCreate(blogs)
}



user = user.map()

async function go() {
    let user1 = await create({ email: '1@gmail.com', password: '123456' })
    let user2 = await create({ email: '2@gmail.com', password: '123456' })
    let user3 = await create({ email: '3@gmail.com', password: '123456' })

    await user1.addFan([user2, user3])
    console.log('@ok')
}

async function readOther(other_id) {
    let other = await User.findOne({
        where: { id: other_id },
        include: [
            {
                model: Blog,
                attributes: ['id', 'title', 'createdAt', 'updatedAt']
            },
            {
                model: User,
                as: 'Idol',
                through: {
                    where: {
                        idol_id: {[Op.ne]: other_id}
                    }
                }
            },
            {
                model: User,
                as: 'Fans',
                through: {
                    where: {
                        fans_id: {[Op.ne]: other_id}
                    }
                }
            }
        ]
    })
    let other_json = other.toJSON()
    console.log('@other => ', other)
    console.log('@other_json => ', other_json)
}

async function go2(){
    let blog = await Blog.create({title: '1 - 1st blog', user_id: 1})
    blog.update({ html: 'xxxx', show: false})
}

async function go2(){

    let blog = await Blog.findByPk(1, {
        include: {
            model: User,
            attributes: ['id'],
            include: {
                model: User,
                as: 'Fans',
                where: {
                    id: {[Op.ne]: 1}
                },
                attributes: ['id']
            }
        }
    })
    console.log('@blog => ', blog)
    await blog.removeFollower(2)
    
}

(
    async () => {
        try {
            await go()
        } catch (e) {
            console.log('@ERR => ', e)
        }
    }
)()