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
    
    if(!res.newsList.length){
        return res
    }

    let promiseList = res.newsList.map(async (item) => {
        let { id, type, target_id, follow_id, confirm, time } = item

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
        let { confirm, time } = item
        if(_newsList.length - 1 === index){
            init.lastTime = time
        }
        confirm && init.confirm.push(item)
        !confirm && init.unconfirm.push(item)
        return init
    }, { unconfirm: [], confirm: [] , lastTime: undefined})

    let data = { ...newsList, count: res.newsList.length, total: res.total }

    return new SuccModel(data)
}

async function readMoreByUserIdAndTime(userId, time){
    await readNews({userId, time})
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
    readMoreByUserIdAndTime,

    confirmNews
}