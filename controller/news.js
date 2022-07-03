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
    let newsList = await readNews({userId})
    if(!newsList.length){
        return []
    }
    
    let news = newsList.map(async (item) => {
        let { id, fans_id, blog_id, confirm, time } = item

        if(fans_id){
            let { nickname } = await readUser({id: fans_id})
            return { type: 1, id, fans_id, nickname, confirm, time }
        }else if(blog_id){
            let { title, author: {id: author_id, nickname }} = await readBlogById(blog_id)
            return ({ type: 2, id, blog_id, title, author_id , nickname, confirm, time })
        }
    })

    news = await Promise.all(news)

    _news = { unconfirm: [], confirm: [], count: news.length }

    news.forEach(item => {
        let { confirm } = item
        confirm && _news.confirm.push(item)
        !confirm && _news.unconfirm.push(item)
    })

    return new SuccModel(_news)
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

    confirmNews
}