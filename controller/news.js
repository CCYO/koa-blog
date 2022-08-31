/**
 * @description Controller news相關
 */

const { htmlStr_newsList } = require('../utils/ejs-render')
const { init_newsOfFollowId } = require('../utils/init')

const { NEWS: { LIMIT } } = require('../conf/constant')
const {
    _readNews,
    readNews,
    updateNews,
} = require('../server/news')

const { ErrModel, SuccModel } = require('../model')
const { removeRemindNews } = require('../db/cache/redis/_redis')

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

/** 藉由 userID 取得 news
 * @param {number} userId 
 * @returns {*} resModel
 */
async function getNewsByUserId(userId, excepts, page) {
    let data = { userId }
    if(excepts){
        data.excepts = excepts
    }
    let res = await _readNews(data)
    await removeRemindNews(userId)
    return new SuccModel(res)
}

async function readMore(ctx){
    let userId = ctx.session.user.id
    let {excepts, page} = ctx.request.body
    let {unconfirm, confirm} = excepts
    if(unconfirm.num === 0){
        if(!ctx.session.news || !ctx.session.news.length){
            //代表這一輪剛完成清空session，還不能存
            let { people, blogs, comments } = confirm
            let data = {userId, excepts: {people, blogs, comments}}
            let res = await _readNews(data)
            return new SuccModel(res)
        }else if(ctx.session.news[page]){
            return new SuccModel(ctx.session.news[page])
        }else{
            let { people, blogs, comments } = confirm
            let data = {userId, excepts: {people, blogs, comments}}
            let res = await _readNews(data)
            ctx.session.news[page] = res
            return new SuccModel(res)
        }
    }else{
        // 執行confirm
        //  _readNews
        //  res 若 num.unconfirm > 0，更新session.news[0]，否則重置session.news = []
    }
}

async function readMoreByUserId(userId, markTime, listOfexceptNewsId, fromFront = false, offset) {

    let { newsList, numOfUnconfirm, total } = await readNews({ userId, markTime, listOfexceptNewsId, fromFront })

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
        blogs: [...confirm.blogs, ...unconfirm.blogs],
        comments: [...confirm.comments, ...unconfirm.comments]
    }

    return new SuccModel(res)
}

async function confirmNews(listOfNewsId) {

    let { people, blogs, comments } = listOfNewsId

    const { rowOfBlogs, rowOfPeople, rowOfComments } = await updateNews(listOfNewsId)
    if (blogs.length !== rowOfBlogs) {
        return new ErrModel(NEWS.BLOG_FANS_CONFIRM_ERR)
    } else if (people.length !== rowOfPeople) {
        return new ErrModel(NEWS.FOLLOW_CONFIRM_ERR)
    } else if (comments.length !== rowOfComments){
        return new ErrModel(NEWS.FOLLOW_COMMENT_CONFIRM_ERR)
    }
    let res = { listOfNewsId, count: rowOfBlogs + rowOfPeople }
    return new SuccModel(res)
}

module.exports = {
    getNewsByUserId,    //  view user
    readMoreByUserId,   //  api news
    confirmNews         //  api news
}