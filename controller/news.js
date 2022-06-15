/**
 * @description Controller news相關
 */

const {
    updateNews,
    updateBlogFansComfirm,
    updateFollowComfirm
} = require('../server/news')

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
    confirmNews
}