/**
 * @description Controller news相關
 */

const { resolve } = require('path')

const myRenderFile = require('../utils/renderFile')
const { initNewsList_4_front } = require('../utils/init/news')

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

async function readMoreByUserId(userId, markTime, listOfNewsId, fromFront = false, offset) {

    let data = await readNews({ userId, markTime, listOfexceptNewsId: listOfNewsId, fromFront })

    let { newsList: { confirm, unconfirm }, numOfUnconfirm, total } = data

    let ejs_newsForEach = resolve(__dirname, '../views/wedgets/navbar/news-forEach.ejs')

    let htmlStr = { confirm: undefined, unconfirm: undefined }

    htmlStr.confirm = confirm.length && await myRenderFile(ejs_newsForEach, { list: confirm }) || undefined
    htmlStr.unconfirm = unconfirm.length && await myRenderFile(ejs_newsForEach, { list: unconfirm }) || undefined

    let listOfConfirmNewsId = initNewsList_4_front(confirm)
    let listOfUnconfirmNewsId = initNewsList_4_front(unconfirm)

    //  直接先作 confirm
    if (unconfirm.length) {
        let resModel = await confirmNews(listOfUnconfirmNewsId)
        if (resModel.errno) {
            return resModel
        }
    }
    listOfConfirmNewsId.people = [...listOfConfirmNewsId.people, ...listOfUnconfirmNewsId.people]
    listOfConfirmNewsId.blogs = [...listOfConfirmNewsId.blogs, ...listOfUnconfirmNewsId.blogs]

    return new SuccModel({ htmlStr, listOfConfirmNewsId, numOfUnconfirm, total, count: confirm.length + unconfirm.length })
}

async function confirmNews(payload) {
    
    let { people, blogs } = payload

    const { blogsRow, peopleRow } = await updateNews(payload)

    if (blogs.length !== blogsRow) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== peopleRow) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    let res = { ListOfConfirmNewsId: payload, count: blogsRow + peopleRow }
    return new SuccModel(res)
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews
}