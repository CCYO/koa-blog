/**
 * @description Controller news相關
 */

const {
    readNews,


    updateNews,
    updateBlogFansComfirm,
    updateFollowComfirm
} = require('../server/news')

const {
    readUser
} = require('../server/user')

const {
    readBlogById
} = require('../server/blog')

const { ErrModel, SuccModel } = require('../model')

const {
    REGISTER: {
        UNEXPECTED,
        IS_EXIST,
        NO_EMAIL,
        NO_PASSWORD
    },
    READ,
    UPDATE,
    FOLLOW,
    NEWS
} = require('../model/errRes')

async function getNewsByUserId(userId){
    let res = await readNews({userId})
    console.log('@sql res => ', res)
    if(!res.newsList.length){
        return res
    }

    let promiseList = res.newsList.map(async (item) => {
        let { id, type, target_id, follow_id, confirm, time } = item
        console.log('@整理前 id => ', id)
        if(type === 1){
            let { id: fans_id, nickname } = await readUser({id: follow_id})
            return { type, id, fans_id, nickname, confirm, time }
        }else if(type === 2){
            let { id: blog_id, title, author: {id: author_id, nickname }} = await readBlogById(target_id)
            return ({ type, id, blog_id, title, author_id , nickname, confirm, time })
        }
    })

    let _newsList = await Promise.all(promiseList)

    let newsList = _newsList.reduce((init, item, index) => {
        let { type, id, confirm, time } = item
        console.log('@ index , id, time => ', index, id, time)
        if(_newsList.length - 1 === index){
            console.log('@ achor index ,id => ', index, id)
            init.achor = { type, id, time }
        }
        confirm && init.confirm.push(item)
        !confirm && init.unconfirm.push(item)
        return init
    }, { unconfirm: [], confirm: [] , achor: undefined})

    let data = { ...newsList, count: res.newsList.length, total: res.total , now: new Date()}

    return new SuccModel(data)
}

async function readMoreByUserId(userId, now){
    console.log('@now => ', now)
    let res = await readNews({userId, now})
    return res
}


async function confirmNews(payload) {
    let { blogs, fans } = payload
    const { blogRow, fansRow } = await updateNews(payload)
    console.log( '@blogs => ', blogs.length)
    console.log( '@blogsRow => ', blogRow)
    console.log( '@fans => ', fans.length)
    console.log( '@fansRow => ', fansRow)
    if(blogs.length !== blogRow){
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    }else if(fans.length !== fansRow){
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    return new SuccModel()
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,

    confirmNews
}