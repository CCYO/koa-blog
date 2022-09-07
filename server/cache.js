const { set, get, del } = require('../db/cache/redis/_redis')
const { readFollowers } = require('./followBlog')
const { readFans } = require('./followPeople')

async function tellBlogFollower(blog_id){
    let followers = await readFollowers({blog_id})
    await remindNews(followers)
}

async function tellPeopleFollower(idol_id){
    let followers = await readFans({idol_id})
    await remindNews(followers)
}

async function tellUser(user_id){
    let followers = await readFollowers({blog_id})
    await remindNews(followers)
}

async function checkNews(id){
    let cacheNews = await get('cacheNews')
    console.log('@cacheNew => ', cacheNews)
    let news = new Set(await get('cacheNews'))
    return news.has(id)
}

async function remindNews(id){
    console.log('++')
    let news = await get('cacheNews')
    console.log('0arr @news => ', news)
    news = new Set(news)
    console.log('0set @news => ', news)
    let listOfUserId = id
    if(!Array.isArray(listOfUserId)){
        listOfUserId = [listOfUserId]
    }

    listOfUserId.forEach( (item) => {
        news.add(item)
        console.log('after add @news => ', news)
    })
    
    await set('cacheNews', [...news])
    console.log('after forEach @cacheNews => ', news)
    return news
}

async function removeRemindNews(id){
    let r = await get('cacheNews')
    let news = new Set(r)
    let listOfUserId = id
    if(!Array.isArray(listOfUserId)){
        listOfUserId = [listOfUserId]
    }
    
    listOfUserId.forEach( (item) => {
        news.delete(item)
    })

    await set('cacheNews', [...news])
    
    return news
}

async function set_blog(blog_id, hash = undefined, val = undefined) {
    if(!hash && !val){
        return await set(`blog/${blog_id}`, '')
    }
    return await set(`blog/${blog_id}`, {[hash]: val})
}

async function del_blog(blog_id) {
    return await del(`blog/${blog_id}`)
}

async function get_blog(blog_id, hash) {
    let kv = await get(`blog/${blog_id}`)
    if(!kv){
        return null
    }
    return kv[hash]
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