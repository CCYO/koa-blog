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
    let { markTime, newsList, total, numOfUnconfirm, more, page } = await readNews({ userId })
    let res = { ...newsList, markTime, total, numOfUnconfirm, more, page }
    return new SuccModel(res)

}

async function readMoreByUserId(userId, markTime, page) {
    // if(page === 0){
    //     page = 1
    // }else if(page === undefined ){
    //     page = 0
    // }
    let data = await readNews({ userId, markTime, page })

    let { newsList: { confirm, unconfirm }, total, numOfAfterMark, more } = data
    console.log('@numOfAfterMark => ', numOfAfterMark)
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
    
    

    res = { ...htmlStr, total, more, numOfAfterMark, page: data.page }

    return new SuccModel(res)
}

async function confirmNews(payload) {

    let { people, blogs } = payload

    const { blogsRow, peopleRow } = await updateNews(payload)

    if (blogs.length !== blogsRow) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== peopleRow) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    }
    return new SuccModel()
}

module.exports = {
    getNewsByUserId,
    readMoreByUserId,
    confirmNews
}