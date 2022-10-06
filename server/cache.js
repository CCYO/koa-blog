const { set, get, del } = require('../db/cache/redis/_redis')
const { readFollowers } = require('./followBlog')
const { readFans } = require('./followPeople')

async function tellBlogFollower(blog_id) {
    let followers = await readFollowers({ blog_id })
    await remindNews(followers)
}

async function tellPeopleFollower(idol_id) {
    let followers = await readFans({ idol_id })
    await remindNews(followers)
}

async function tellUser(user_id) {
    let followers = await readFollowers({ blog_id })
    await remindNews(followers)
}

async function checkNews(id) {
    let cacheNews = await get('cacheNews')
    console.log('@get cacheNews => ', cacheNews)
    return new Set(cacheNews).has(id)
}

async function remindNews(id) {
    console.log('++')
    let news = await get('cacheNews')
    news = new Set(news)
    let listOfUserId = id
    if (!Array.isArray(listOfUserId)) {
        listOfUserId = [listOfUserId]
    }

    listOfUserId.forEach((item) => {
        console.log(`@使用者${item}有新通知囉`)
        news.add(item)
    })

    await set('cacheNews', [...news])
    return news
}

async function removeRemindNews(id) {
    let r = await get('cacheNews')
    let news = new Set(r)
    let listOfUserId = id
    if (!Array.isArray(listOfUserId)) {
        listOfUserId = [listOfUserId]
    }

    listOfUserId.forEach((item) => {
        news.delete(item)
    })

    await set('cacheNews', [...news])

    return news
}

async function set_blog(blog_id, hash = undefined, val = undefined) {
    if (!hash && !val) {
        return await set(`blog/${blog_id}`, '')
    }
    return await set(`blog/${blog_id}`, [[hash, val]])
}

async function del_blog(blog_id) {
    return await del(`blog/${blog_id}`)
}

async function get_blog(blog_id, etag) {
    //  取緩存KV
    let blog = await get(`blog/${blog_id}`)
    if (!blog) {  //若沒有，則退出
        return []
    }
    //  取緩存KV
    let kv = [...new Map(blog).entries()][0]
    let exist = kv[0] === etag ? true : false
    if (!exist) { // 代表etag失效or前端根本沒緩存
        return kv // 給予現存KV
    }
    return [true] // 告知etag有效 
}

module.exports = {
    tellBlogFollower,
    tellPeopleFollower,
    remindNews,
    removeRemindNews,
    checkNews,
    set_blog,
    del_blog,
    get_blog
}