const {
    clear,

    set, get } = require('../db/cache/redis/_redis')
const { readFollowers } = require('./followBlog')
const { readFans } = require('./followPeople')

const { CACHE: { TYPE: { BLOG, USER, NEWS }}} = require('../conf/constant')

const { isNoCache } = require('../utils/env')

async function modifyCache(cache) {
    //  當前若是 noCache 模式 || SuccessModel.cache 無定義
    if (isNoCache || !cache) {
        return
    }
    
    await removeCache({
        [USER]: cache[USER],
        [BLOG]: cache[BLOG]
    })
    await addNewsCache(cache[NEWS])

    return
}

async function removeCache(obj) {
    let kvPairs = Object.entries(obj)
    let promiseList = kvPairs.map(async ([key, list]) => {
        if (!list || !list.length) {
            return Promise.resolve()
        }else if( !Array.isArray(list) ){
            list = [list]
        }
        let set = [...new Set(list)]
        return set.map(async (id) => {
            return await clear(`${key}/${id}`)
        })
    })
    return Promise.all(promiseList)
}

//  向相關使用者通知news有變動，待他們下一次請求時，主動向系統請求數據
async function addNewsCache(users) {
    if(!users || !users.length){
        return
    }else if( !Array.isArray(users) ){
        users = [users]
    }

    //  取出緩存資料 redis/cacheNews
    let cache = await get(NEWS)
    //  將資料設為 Set，以便除去重複值
    let set_people = new Set(cache)
    
    //  將 cache 與 user 合併
    users.forEach((user) => {
        set_people.add(user)
    })
    console.log('@ ==> ', [...set_people])
    //  緩存
    await set(NEWS, [...set_people])
    return
}

async function removeCacheBlog(blogList) {
    if (!Array.isArray(blogList)) {
        blogList = [blogList]
    }
    blogList = [...new Set(blogList)]

    let list = Promise.all(
        blogList.map(async (blog_id) => {
            console.log(`@ 將系統緩存 blog/${blog_id} 刪除`)
            return await del(`blog/${blog_id}`)
        })
    )
    return await list
}


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

async function set_public(string) {

}

async function get_public() {

}

async function checkNews(id) {
    let cacheNews = await get('cacheNews')
    cacheNews = new Set(cacheNews)
    console.log(`@ 向系統緩存撈取 cacheNews 數據 =>`, [...cacheNews])
    return cacheNews.has(id)
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



async function get_user(user_id, ifNoneMatch) {
    //  取緩存KV
    let user = await get(`user/${user_id}`)
    let res = { exist: 3, kv: undefined }
    if (!user) {  //    若系統cache沒有資料
        console.log(`@系統緩存 user/${user_id} 沒有資料`)
        return res  //  exist: 3 代表無緩存
    }
    //  若系統cache有資料
    res.kv = [...new Map(user).entries()][0]    //  [K, V]
    console.log(`@系統緩存 user/${user_id} 有資料`)
    if (!ifNoneMatch) {
        console.log(`@此次 user/${user_id} 緩存請求未攜帶 if-none-match → 直接使用系統緩存`)
        res.exist = 2   //  代表請求未攜帶 if-none-match
    } else if (ifNoneMatch !== res.kv[0]) {
        console.log(`@此次 user/${user_id} 緩存請求所攜帶的if-none-match 已過期 → 所以直接使用系統緩存`)
        console.log('@if-none-match => ', ifNoneMatch)
        console.log('@etag => ', res.kv[0])
        res.exist = 1   //  代表請求 if-none-match 已過期
    } else {
        console.log(`@此次 user/${user_id} 緩存請求所攜帶的if-none-match 是最新的`)
        res.exist = 0  //  代表請求 if-none-match 仍是最新的
    }
    return res
}


async function get_blog(blog_id, ifNoneMatch) {
    //  取緩存KV
    let blog = await get(`blog/${blog_id}`)
    let res = { exist: 3, kv: undefined }
    if (!blog) {  //    若系統cache沒有資料
        console.log(`@ 系統緩存 blog/${blog_id} 沒有資料`)
        return res  //  exist: 3 代表無緩存
    }
    //  若系統cache有資料
    res.kv = [...new Map(blog).entries()][0]    //  [K, V]
    console.log(`@ 系統緩存 blog/${blog_id} 有資料`)
    if (!ifNoneMatch) {
        console.log(`@ 此次 blog/${blog_id} 緩存請求未攜帶 if-none-match → 直接使用系統緩存`)
        res.exist = 2   //  代表請求未攜帶 if-none-match
    } else if (ifNoneMatch !== res.kv[0]) {
        console.log(`@ 此次 blog/${blog_id} 緩存請求所攜帶的if-none-match 已過期 → 所以直接使用系統緩存`)
        console.log('@ if-none-match => ', ifNoneMatch)
        console.log('@ etag => ', res.kv[0])
        res.exist = 1   //  代表請求 if-none-match 已過期
    } else {
        console.log(`@ 此次 blog/${blog_id} 緩存請求所攜帶的if-none-match 是最新的`)
        res.exist = 0  //  代表請求 if-none-match 仍是最新的
    }
    return res
}

async function set_user(user_id, hash = undefined, val = undefined) {
    if (!hash && !val) {
        return await set(`user/${user_id}`, '')
    }
    return await set(`user/${user_id}`, [[hash, val]])
}



async function get_user(user_id, ifNoneMatch) {
    //  取緩存KV
    let user = await get(`user/${user_id}`)
    let res = { exist: 3, kv: undefined }
    if (!user) {  //    若系統cache沒有資料
        console.log(`@系統緩存 user/${user_id} 沒有資料`)
        return res  //  exist: 1 代表無緩存
    }
    //  若系統cache有資料
    res.kv = [...new Map(user).entries()][0]    //  [K, V]
    console.log(`@系統緩存 user/${user_id} 有資料`)
    if (!ifNoneMatch) {
        console.log(`@此次 user/${user_id} 緩存請求未攜帶 if-none-match → 直接使用系統緩存`)
        res.exist = 2   //  代表請求未攜帶 if-none-match
    } else if (ifNoneMatch !== res.kv[0]) {
        console.log(`@此次 user/${user_id} 緩存請求所攜帶的if-none-match 已過期 → 所以直接使用系統緩存`)
        console.log('@if-none-match => ', ifNoneMatch)
        console.log('@etag => ', res.kv[0])
        res.exist = 1   //  代表請求 if-none-match 已過期
    } else {
        console.log(`@此次 user/${user_id} 緩存請求所攜帶的if-none-match 是最新的`)
        res.exist = 0  //  代表請求 if-none-match 仍是最新的
    }
    return res
}

module.exports = {
    modifyCache,

    removeCache,
    addNewsCache,

    tellBlogFollower,
    tellPeopleFollower,
    
    removeRemindNews,
    checkNews,
    set_blog,

    get_blog,
    set_user,

    get_user,
    set_public, get_public
}