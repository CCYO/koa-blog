/**
 * @description Controller news相關
 */

const { resolve } = require('path')

const myRenderFile = require('../utils/renderFile')
const { init_4_newsList } = require('../utils/init/news')

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
    let { newsList, markTime, total, numOfUnconfirm} = await readNews({ userId })
    let res = { ...newsList, markTime, total, numOfUnconfirm}
    return new SuccModel(res)

}

async function readMoreByUserId(userId, markTime, offset) {
    
    let data = await readNews({ userId, markTime, offset })

    
    let { newsList: { confirm, unconfirm }, numOfAfterMark, total, numOfUnconfirm } = data
    
    let ejs_newsForEach = resolve(__dirname, '../views/wedgets/navbar/news-forEach.ejs')
    // res = { confirm: [], unconfirm: [], count: newsList.length, total, markTime, page }

    let htmlStr = { confirm: undefined, unconfirm: undefined }

    htmlStr.confirm = confirm.length && await myRenderFile(ejs_newsForEach, { list: confirm }) || undefined
    htmlStr.unconfirm = unconfirm.length && await myRenderFile(ejs_newsForEach, { list: unconfirm }) || undefined

    //  直接先作 confirm
    if(unconfirm.length){
        let payload = unconfirm.reduce((init, curVal) => {
            let { type, id } = curVal
            type === 1 && init.people.push(id)
            type === 2 && init.blogs.push(id)
            return init
        }, { people: [], blogs: [] })
    
        console.log('@payload => ', payload)
        let resModel = await confirmNews(payload)
        console.log('@resMoedl => ', resModel)
        if(resModel.errno){
            return resModel
        }
    }    

    if(offset === undefined){
        let res = {
            htmlStr,
            offset: (numOfUnconfirm * -1) + unconfirm.length + confirm.length,
            total: total - unconfirm.length
        }
        return new SuccModel(res)
    }
    let count = { confirm: confirm.length, unconfirm: unconfirm.length}
    return new SuccModel({ htmlStr, numOfAfterMark, count })
}

async function confirmNews(payload) {

    let { people, blogs } = payload

    const { blogsRow, peopleRow } = await updateNews(payload)

    if (blogs.length !== blogsRow) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== peopleRow) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    let res = { rowOfUpdate: blogsRow + peopleRow }
    return new SuccModel(res)
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews
}