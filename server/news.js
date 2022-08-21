const { NEWS: { LIMIT } } = require('../conf/constant')

const {
    FollowBlog,
    FollowPeople,
    FollowComment
} = require('../db/mysql/model')

const rawQuery = require('../db/mysql/query')

/** 查找 newsList
 * @param {{ 
 *  userId: number,
 *  markTime: string,
 *  listOfexceptNewsId: { object: { people: [number], blogs: [number]}},
 *  fromFront: boolean,
 *  offset: number
 * }} param0 - 查詢 newsList 需要的參數物件
 *  
 * @param {number} param0.userId - userId
 * @param {string} param0.markTime yyyy-mm-ddTHH:MM:sssZ 的 時間格式
 * @param {object} param0.listOfexceptNewsId 需撇除的 newsList
 * @param {boolean} param0.fromFront 此查詢是否來自前端
 * @returns { { newsList: array, markTime: string, total: number, numOfUnconfirm: number, numOfAfterMark: number } }  newsList 通知的數據 / markTime 時間標記 \n total 通知總數 / numOfUnconfirm 若!param0.fromFront，則會有此值，代表 RV.markTime 前的 unconfirmNews 數量 / numOfAfterMark 若param0.fromFront，則會有此值，代表 RV.markTime 後的 unconfirmNews 數量
 */
async function readNews({ userId, markTime = new Date().toISOString(), listOfexceptNewsId = { people: [], blogs: [], comments: [] }, fromFront = false }) {

    let newsList = await rawQuery.readNews({ userId, options: { markTime, fromFront, listOfexceptNewsId } })

    let { numOfUnconfirm, total } = await rawQuery.countNewsTotalAndUnconfirm({ userId, options: {markTime, fromFront} })

    //  markTime 與 limit 僅用在 Router - VIEW
    return { newsList, numOfUnconfirm, total, markTime, limit: LIMIT }
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

async function updateNews({ people, blogs, comments }) {
    let data = {}
    if (people.length) {
        let [rowOfPeople] = await FollowPeople.update({ confirm: true }, { where: { id: people } })
        data.rowOfPeople = rowOfPeople
    } else {
        data.rowOfPeople = 0
    }

    if (blogs.length) {
        let [rowOfBlogs] = await FollowBlog.update({ confirm: true }, { where: { id: blogs } })
        data.rowOfBlogs = rowOfBlogs
    } else {
        data.rowOfBlogs = 0
    }

    if (comments.length) {
        let [rowOfComments] = await FollowComment.update({ confirm: true }, { where: { id: comments } })
        data.rowOfComments = rowOfComments
    } else {
        data.rowOfComments = 0
    }

    return data
}

module.exports = {
    readNews,
    updateFollowComfirm,
    updateBlogFansComfirm,
    updateNews
}