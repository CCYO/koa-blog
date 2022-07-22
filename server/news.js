const { Op, QueryTypes } = require('sequelize')

const { NEWS: { LIMIT }} = require('../conf/constant')
const {
    seq,
    FollowBlog: FB,
    FollowPeople,

    Follow, Blog
} = require('../db/model')

const { init_4_newsList } = require('../utils/init/news')

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

async function readNews({ userId, markTime = new Date(), offset = undefined }) {
    let checkNewsAfterMarkTime = (offset !== undefined) ? true : false
    offset = (offset === undefined) ? 0 : offset
    markTime = new Date(markTime).toISOString()

    let queryNewsList = await createQuery.newsList({ userId, markTime, offset })
    let newsList = await seq.query(queryNewsList, { type: QueryTypes.SELECT })

    //  newsList = [ { type, id, target_id, follow_id, confirm, time }, ... ]
    //  res = { mark, newsList }
    newsList = await init_4_newsList(newsList)

    let res = { newsList, markTime }

    if (!checkNewsAfterMarkTime) {
        let queryTotal = await createQuery.newsTotal({ userId, markTime })
        let [{ numOfUnconfirm, total }] = await seq.query(queryTotal, { type: QueryTypes.SELECT })

        //  { total, numOfUnconfirm }

        //  { mark, newsList, total, numOfUnconfirm }
        
        // let more = total > res.page * LIMIT

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