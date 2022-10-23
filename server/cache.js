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
    cacheNews = new Set(cacheNews)
    console.log(`@ 向系統緩存撈取 cacheNews 數據 =>`, [...cacheNews])
    return cacheNews.has(id)
}

async function remindNews(id) {
    let news = await get('cacheNews')
    news = new Set(news)

    let listOfUserId = id
    if (!Array.isArray(listOfUserId)) {
        listOfUserId = [listOfUserId]
    }
    
    listOfUserId = [ ...new Set(listOfUserId) ]

    listOfUserId.forEach((item) => {
        console.log(`@ user_id:${item} 的 session.news 有更動`)
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
        console.log(`@ 從系統緩存 cacheNews 移除 ${item} `)
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

async function del_blogs(blogList) {
    if(!Array.isArray(blogList)){
        blogList = [blogList]
    }
    blogList = [ ...new Set(blogList) ]

    let list = Promise.all(
        blogList.map( async (blog_id) => {
            console.log(`@將系統緩存 blog/${blog_id} 刪除`)
            return await del(`blog/${blog_id}`)
        })
    )
    return await list
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

async function set_user(user_id, hash = undefined, val = undefined) {
    if (!hash && !val) {
        return await set(`user/${user_id}`, '')
    }
    return await set(`user/${user_id}`, [[hash, val]])
}

async function del_users(userList) {
    if(!Array.isArray(userList)){
        userList = [userList]
    }
    userList = [ ...new Set(userList) ]
    let list = Promise.all(
        userList.map( async (user_id) => {
            console.log(`@將系統緩存 user/${user_id} 刪除`)
            return await del(`user/${user_id}`)
        })
    )
    return await list
}

async function get_user(user_id, ifNoneMatch) {
    //  取緩存KV
    let user = await get(`user/${user_id}`)
    let res = { exist: 3, kv: undefined}
    if (!user) {  //    若系統cache沒有資料
        console.log(`@系統緩存 user/${user_id} 沒有資料`)
        return res  //  exist: 1 代表無緩存
    }
    //  若系統cache有資料
    res.kv = [...new Map(user).entries()][0]    //  [K, V]
    console.log(`@系統緩存 user/${user_id} 有資料`)
    if(!ifNoneMatch){
        console.log(`@此次 user/${user_id} 緩存請求未攜帶 if-none-match → 直接使用系統緩存`)
        res.exist = 2   //  代表請求未攜帶 if-none-match
    }else if(ifNoneMatch !== res.kv[0]){
        console.log(`@此次 user/${user_id} 緩存請求所攜帶的if-none-match 已過期 → 所以直接使用系統緩存`)
        console.log('@if-none-match => ', ifNoneMatch)
        console.log('@etag => ', res.kv[0])
        res.exist = 1   //  代表請求 if-none-match 已過期
    }else{
        console.log(`@此次 user/${user_id} 緩存請求所攜帶的if-none-match 是最新的`)
        res.exist = 0  //  代表請求 if-none-match 仍是最新的
    }
    return res
}

module.exports = {
    tellBlogFollower,
    tellPeopleFollower,
    remindNews,
    removeRemindNews,
    checkNews,
    set_blog,
    del_blogs,
    get_blog,
    set_user,
    del_users,
    get_user
}