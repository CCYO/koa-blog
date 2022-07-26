/**
 * @description Controller news相關
 */

const { resolve } = require('path')

const myRenderFile = require('../utils/renderFile')
const { init_listOfNewsId } = require('../utils/init/news')

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
    let { newsList, markTime, total, numOfUnconfirm } = await readNews({ userId })
    let res = { ...newsList, markTime, total, numOfUnconfirm }
    return new SuccModel(res)

}

async function readMoreByUserId(userId, markTime, listOfexceptNewsId, fromFront = false, offset) {

    let data = await readNews({ userId, markTime, listOfexceptNewsId, fromFront })

    let { newsList: { confirm, unconfirm }, numOfUnconfirm, total } = data

    let ejs_newsForEach = resolve(__dirname, '../views/wedgets/navbar/news-forEach.ejs')

    let htmlStr = { confirm: undefined, unconfirm: undefined }

    htmlStr.confirm = confirm.length && await myRenderFile(ejs_newsForEach, { list: confirm }) || undefined
    htmlStr.unconfirm = unconfirm.length && await myRenderFile(ejs_newsForEach, { list: unconfirm }) || undefined

    let listOfNewsId = { confirm: init_listOfNewsId(confirm), unconfirm: init_listOfNewsId(unconfirm) }

    //  直接先作 confirm
    if (unconfirm.length) {
        let resModel = await confirmNews(listOfNewsId.unconfirm)
        if (resModel.errno) {
            return resModel
        }
    }

    listOfNewsId.confirm = {
        people: [...listOfNewsId.confirm.people, ...listOfNewsId.unconfirm.people],
        blogs: [...listOfNewsId.confirm.blogs, ...listOfNewsId.unconfirm.blogs]
    }

    return new SuccModel({ htmlStr, listOfNewsId: listOfNewsId.confirm, numOfUnconfirm, total, count: confirm.length + unconfirm.length })
}

async function confirmNews(listOfNewsId) {
    
    let { people, blogs } = listOfNewsId

    const { rowOfBlogs, rowOfPeople } = await updateNews(listOfNewsId)

    if (blogs.length !== rowOfBlogs) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== rowOfPeople) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    let res = { listOfNewsId, count: blogsRow + peopleRow }
    return new SuccModel(res)
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews
}