const { Op, QueryTypes } = require('sequelize')

const { 
    seq,
    FollowBlog: FB,

    Follow, Blog_Fans, Blog
} = require('../db/model')

const sqlQuery = require('../db/query')

async function createFollowers({blog_id, followerList_id}){
    let data = followerList_id.map( follower_id => ({ blog_id, follower_id }) )
    let res = await FB.bulkCreate((data))
    console.log('res')
    return res
}

async function hiddenBlog({blog_id}){
    let row = await FB.destroy({ where: {blog_id, confirm: false}})
    console.log('@row=> ', row)
}

async function restoreBlog({blog_id}){
    let res = await FB.restore({where: {blog_id}})
    console.log('@res=> ', res)
}

async function readFollowers({blog_id, onlyId = true}){
    let res = await FB.findAll({
        attributes: ['follower_id'],
        where: {blog_id},
    })
    
    if(!res.length){
        return []
    }

    let followerList = res.map( item => {
        let { follower_id } = item.toJSON()

        return follower_id
    })
    
    return followerList
}

async function deleteBlog({blogList_id, follower_id}){
    let res = await seq.getQueryInterface().bulkDelete('FollowBlogs', {
        follower_id,
        blog_id: {[Op.in]: blogList_id}    
    })
    // return row
}

async function readNews({userId, now = undefined, offset = 0}){
    let q_news = await sqlQuery.news({userId, now, offset})
    let q_count = await sqlQuery.newsTotal({userId, now})
    let newsList = await seq.query(q_news, { type: QueryTypes.SELECT })
    let [{total}] = await seq.query(q_count, { type: QueryTypes.SELECT })
    return { newsList, total }
}

//  未完成
async function softDeleteNewsOfBlog(blog_id){
    await Blog_Follow.findAll({
        where: { blog_id },
        
        include: {
            model: News,
            where: { confirm: false}
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

async function updateNews({ blogs, fans }) {
    let data = {}
    if (blogs.length) {
        let [blogRow] = await Blog_Fans.update({ confirm: true }, { where: { id: blogs } })
        data.blogRow = blogRow
    }
    if (blogs.length) {
        let [fansRow] = await Follow.update({ confirm: true }, { where: { id: fans } })
        data.fansRow = fansRow
    }
    return data
    
}

let FollowBlog = {
    createFollowers,
    hiddenBlog,
    restoreBlog,
    readFollowers,
    deleteBlog
}

module.exports = {
    FollowBlog,
    readNews,
    

    updateFollowComfirm,
    updateBlogFansComfirm,
    updateNews
}