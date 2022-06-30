const { 
    seq,


    Blog_Follow,

    Follow, Blog_Fans
} = require('../db/model')


async function readNews({userId}){
    let query = 
    `
    SELECT 
    FROM Follow_People P LEFT JOIN Follow_Blog

    `
    await seq.query()
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

module.exports = {
    readNews,

    updateFollowComfirm,
    updateBlogFansComfirm,
    updateNews
}