const { Op, QueryTypes } = require('sequelize')

const { NEWS: { LIMIT }} = require('../conf/constant')
const {
    seq,
    FollowBlog: FB,
    FollowPeople,

    Follow, Blog
} = require('../db/model')

const { initNewsList_4_ejs } = require('../utils/init/news')

const createQuery = require('../db/query')

async function createFollowers({ blog_id, followerList_id }) {
    let data = followerList_id.map(follower_id => ({ blog_id, follower_id }))
    let res = await FB.bulkCreate((data))
    console.log('res')
    return res
}

async function hiddenBlog({ blog_id }) {
    let row = await FB.destroy({ where: { blog_id, confirm: false } })
    console.log('@row=> ', row)
}

async function restoreBlog({ blog_id }) {
    let res = await FB.restore({ where: { blog_id } })
    console.log('@res=> ', res)
}

async function readFollowers({ blog_id, onlyId = true }) {
    let res = await FB.findAll({
        attributes: ['follower_id'],
        where: { blog_id },
    })

    if (!res.length) {
        return []
    }

    let followerList = res.map(item => {
        let { follower_id } = item.toJSON()

        return follower_id
    })

    return followerList
}

async function deleteBlog({ blogList_id, follower_id }) {
    let res = await seq.getQueryInterface().bulkDelete('FollowBlogs', {
        follower_id,
        blog_id: { [Op.in]: blogList_id }
    })
    // return row
}

/** 查找 newsList
 * @param {{ 
 *  userId: number,
 *  markTime: string,
 *  listOfexceptNewsId: object,
 *  fromFront: boolean,
 *  offset: number
 * }} param0 - 查詢 newsList 需要的參數物件
 *  
 * @param {number} param0.userId - userId
 * @param {string} param0.markTime yyyy-mm-ddTHH:MM:sssZ 的 時間格式
 * @param {object} param0.listOfexceptNewsId 需撇除的 newsList
 * @param {boolean} param0.fromFront 此查詢是否來自前端
 * @return {object} 若 formFront 則 { newsList, markTime, total, numOfAfterMark}，若 !formFront 則 { newsList, markTime, total, numOfUnconfirm}
 */
async function readNews({ userId, markTime = new Date().toISOString(), listOfexceptNewsId = { people: [], blogs: []} , fromFront = false, offset = undefined }) {

    let checkNewsAfterMarkTime = fromFront ? true : false
    let whereOps = {markTime, listOfexceptNewsId}
    let queryNewsList = await createQuery.newsList({ userId, offset, whereOps, checkNewsAfterMarkTime })
    let newsList = await seq.query(queryNewsList, { type: QueryTypes.SELECT })
    
    newsList = await initNewsList_4_ejs(newsList)

    let res = { newsList, markTime }

    if (!checkNewsAfterMarkTime) {
        //  若是由後端自行提出的查詢，不需要查詢 markTime 之後 且 未查看的 news
        let queryTotal = await createQuery.newsTotal({ userId, markTime })
        let [{ numOfUnconfirm, total }] = await seq.query(queryTotal, { type: QueryTypes.SELECT })

        return { ...res, numOfUnconfirm, total}
    }

    let queryAfterTimeMarkTotal = await createQuery.newsTotal({ userId, markTime, checkNewsAfterMarkTime })
    let [{ numOfAfterMark, total }] = await seq.query(queryAfterTimeMarkTotal, { type: QueryTypes.SELECT })

    // let more = total > res.page * LIMIT
    //  { mark, newsList, total, numOfAfterMark }
    return { ...res, numOfAfterMark, total}
}

async function updateFB(data, options){
    options = { ...options, paranoid: false }
    const [row] = await FB.update(data, options)
    return row
}

//  未完成
async function softDeleteNewsOfBlog(blog_id) {
    await Blog_Follow.findAll({
        where: { blog_id },

        include: {
            model: News,
            where: { confirm: false }
        }
    })
}

async function updateFollowComfirm(list, data = { confirm: true }) {
    let [row] = await Follow.update(data, {
        where: { id: list }
    })
    return row
}

async function updateBlogFansComfirm(list, data = { confirm: true }) {
    let [row] = await Blog_Fans.update(data, {
        where: { id: list }
    })
    return row
}

async function updateNews({ people, blogs }) {
    let data = {}
    if (people.length) {
        let [peopleRow] = await FollowPeople.update({ confirm: true }, { where: { id: people } })
        data.peopleRow = peopleRow
    }else{
        data.peopleRow = 0
    }

    if (blogs.length) {
        let [blogsRow] = await FB.update({ confirm: true }, { where: { id: blogs } })
        data.blogsRow = blogsRow
    }else{
        data.blogsRow = 0
    }

    console.log('@data Row => ', data)
    
    return data

}

let FollowBlog = {
    createFollowers,
    hiddenBlog,
    restoreBlog,
    readFollowers,
    deleteBlog,
    updateFB
}

module.exports = {
    FollowBlog,
    readNews,


    updateFollowComfirm,
    updateBlogFansComfirm,
    updateNews
}