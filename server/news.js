const { Follow, Blog_Fans } = require('../db/model')

async function updateFollowComfirm(list, data = { confirm: true}){
    let [row] = await Follow.update(data, {
        where: { id: list }
    })
    return row
}

async function updateBlogFansComfirm(list, data = { confirm: true}){
    let [row] = await Blog_Fans.update(data, {
        where: { id: list }
    })
    return row
}

module.exports = {
    updateFollowComfirm,
    updateBlogFansComfirm
}