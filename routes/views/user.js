/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login, view_check_isMe } = require('../../middleware/check_login')

const { getBlogListByUserId } = require('../../controller/blog')

const { getNewsByUserId } = require('../../controller/news')

const {
    getPeopleById
} = require('../../controller/user')

const { cacheUser, cacheSelf } = require('../../middleware/cache')
const { confirmFollow } = require('../../middleware/confirmFollow')

//  註冊頁
router.get('/register', async (ctx, next) => {
    //  若已登入，跳轉到個人頁面
    if (ctx.session.user) {
        return ctx.redirect('/self')
    }

    await ctx.render('register&login', {
        title: 'REGISTER',
        //  導覽列數據
        logging: false,
        //  導覽列數據 & 卡片Tab 數據
        active: 'register'
    })
})

//  登入頁
router.get('/login', async (ctx, next) => {
    //  若已登入，跳轉到個人頁面
    if (ctx.session.user) {
        return ctx.redirect('/self')
    }

    await ctx.render('register&login', {
        title: 'LOGIN',
        //  導覽列數據
        logging: false,
        //  導覽列數據 & 卡片Tab 數據
        active: 'login'
    })
})

//  個人頁
router.get('/self', view_check_login, cacheSelf, async (ctx, next) => {
    let id = ctx.session.user.id

    //  ctx.cache.user = { exist: 0 || 1 || 2 || 3, kv: [K, V] }
    let {exist, kv} = ctx.cache
    if (exist === 3) {
        let { data: { currentUser, fansList, idolList } } = await getPeopleById(id)
        let { data: blogList } = await getBlogListByUserId(id)
        ctx.cache.user = [ undefined, { currentUser, fansList, idolList, blogList }]
        console.log(`@user/${id} 完成 DB撈取`)
    }else{
        let [ etag, user ] = kv
        ctx.cache.user = [ etag, user ]
    }

    let { currentUser, fansList, idolList, blogList } = ctx.cache.user[1]

    if(currentUser.id !== id){
        ctx.body = '你哪位'
    }

    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,

        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogList,       //  window.data 數據
        fansList,       //  window.data 數據
        idolList,       //  window.data 數據
    })
})

//  他人頁
router.get('/other/:id', view_check_isMe, confirmFollow, cacheUser, async (ctx, next) => {
    const { id } = ctx.params
    //   = { exist: BOO, kv: [K, V] }
    let { exist, kv } = ctx.cache
    if (exist === 3) {
        let { data: { currentUser, fansList, idolList } } = await getPeopleById(id)
        let { data: blogList } = await getBlogListByUserId(id)
        ctx.cache.user =[ undefined, { currentUser, fansList, idolList, blogList } ]
        console.log(`@user/${id} 完成 DB撈取`)
    }else{
        let [ etag, user ] = kv
        ctx.cache.user = [ etag, user ]
    }

    let { currentUser, fansList, idolList, blogList } = ctx.cache.user[1]
    //  非文章作者，所以不傳入未公開的文章
    blogList.hidden = []
    
    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,

        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogList,       //  window.data 數據
        fansList,       //  window.data 數據
        idolList,       //  window.data 數據
    })
})

//  個資更新頁
router.get('/setting', view_check_login, async (ctx, next) => {
    const { user: currentUser } = ctx.session

    //  導覽列數據
    // let { data: newsList } = await getNewsByUserId(me.id)

    await ctx.render('setting', {
        title: `${currentUser.nickname}的個資`,
        

        //  window.data 數據
        currentUser
    })
})

router.get('/test', async (ctx) => {
    let keys = ctx.headers
    console.log(keys)
    console.log(ctx.headers['if-none-match'])
    let etag = ctx.headers.hasOwnProperty('if-none-match') ? JSON.parse(ctx.headers['if-none-match']) : undefined

    if (etag && etag === 'test08242320') {
        console.log(304)
        // ctx.set({
        //     etag: JSON.stringify('test08242320'),
        //     ['Cache-Control']: 'no-cache'
        // })
        ctx.status = 304
        console.log(ctx.message)
        ctx.message = 'Not Modified'
        console.log(ctx.message)
        return
    }
    console.log(456)
    let str = JSON.stringify('test08242320')
    ctx.set({
        etag: str,
        ['Cache-Control']: 'no-cache'
    })
    ctx.body = { a: 'A' }
})

module.exports = router