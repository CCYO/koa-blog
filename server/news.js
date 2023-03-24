const { NEWS: { LIMIT } } = require('../conf/constant')

const {
    FollowBlog,
    FollowComment,
    IdolFans
} = require('../db/mysql/model')

const rawQuery = require('../db/mysql/query')

async function readNews({ userId, excepts = { people: [], blogs: [], comments: [] }}) {
    /*
    {
        unconfirm: [
        { type, id, timestamp, confirm, fans: ... },
        { type, id, timestamp, confirm, blog: ... },
        { type, id, timestamp, confirm, comment: ... },
        ... ],
        confirm: [...] 
    }*/
    let newsList = await rawQuery.readNews({ userId, excepts })
    //   { num: { unconfirm, confirm, total } }
    let { num } = await rawQuery.count({ userId, excepts })
    return { newsList, num, limit: LIMIT }
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
        let [rowOfPeople] = await IdolFans.update({ confirm: true }, { where: { id: people } })
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