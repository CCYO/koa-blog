/**
 * @description Controller news相關
 */

const { htmlStr_newsList } = require('../utils/ejs-render')
const { init_newsOfFollowId } = require('../utils/init')

const { NEWS: { LIMIT } } = require('../conf/constant')
const {
    readNews,
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


async function getNewsByUserId(userId) {
    // let { newsList, markTime, total, numOfUnconfirm } = await readNews({ userId })
    // let res = { ...newsList, markTime, total, numOfUnconfirm }
    let res = await readNews({ userId })
    return new SuccModel(res)

}

async function readMoreByUserId(userId, markTime, listOfexceptNewsId, fromFront = false, offset) {

    let { newsList, numOfUnconfirm, total } = await readNews({ userId, markTime, listOfexceptNewsId, fromFront })

    console.log('@@@ => { newsList, numOfUnconfirm, total } => ', { newsList, numOfUnconfirm, total })
    let count = newsList.confirm.length + newsList.unconfirm.length
    let htmlStr = await htmlStr_newsList(newsList)

    let { confirm, unconfirm } = init_newsOfFollowId(newsList)

    let res = {
        numOfUnconfirm,
        total,
        count,
        htmlStr,
        listOfNewsId: confirm
    }

    if (!newsList.unconfirm.length) {
        return new SuccModel(res)
    }

    //  若有 unconfirm 則直接作 confirm
    let resModel = await confirmNews(unconfirm)
    if (resModel.errno) {
        return resModel
    }

    res.listOfNewsId = {
        people: [...confirm.people, ...unconfirm.people],
        blogs: [...confirm.blogs, ...unconfirm.blogs]
    }

    return new SuccModel(res)
}

async function confirmNews(listOfNewsId) {

    let { people, blogs } = listOfNewsId

    const { rowOfBlogs, rowOfPeople } = await updateNews(listOfNewsId)
    if (blogs.length !== rowOfBlogs) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== rowOfPeople) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    let res = { listOfNewsId, count: rowOfBlogs + rowOfPeople }
    return new SuccModel(res)
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews
}