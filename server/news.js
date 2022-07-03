const { Op, QueryTypes } = require('sequelize')

const { 
    seq,
    FollowBlog: FB,

    Follow, Blog_Fans, Blog
} = require('../db/model')

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

async function readNews({userId}){
    let query = 
    `
    SELECT id, idol_id, fans_id, blog_id, follower_id, confirm, time
    FROM (
        SELECT P.id as id, P.idol_id, P.fans_id, B.blog_id, B.follower_id, P.confirm as confirm, P.createdAt as time
        FROM FollowPeople P LEFT JOIN FollowBlogs B
        ON B.id = null      
        WHERE P.idol_id=${userId}
        UNION
        SELECT B.id as id, P.idol_id, P.fans_id, B.blog_id, B.follower_id, B.confirm as confirm, B.createdAt as time
        FROM FollowPeople P RIGHT JOIN FollowBlogs B
        ON P.id = null
        WHERE B.follower_id=${userId} AND B.deletedAt IS NULL
    ) AS A
    ORDER BY time DESC
    
    `
    let newsList = await seq.query(query, { type: QueryTypes.SELECT })

    return newsList
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