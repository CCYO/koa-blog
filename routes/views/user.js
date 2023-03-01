/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { 
    getBlogListByUserId //  0228
} = require('../../controller/blog')

const {
    
    getRelationShipByUserId      //   0228
} = require('../../controller/user')

const {
    CACHE: {
        TYPE: {
            PAGE        //  0228
        },
            HAS_CACHE,  //  0228
            NO_CACHE,    //  0228
            NO_IF_NONE_MATCH
    } } = require('../../conf/constant')

const Cache = require('../../middleware/cache') //  0228

const {
    view_check_isMe,

    view_check_login    //  0228
} = require('../../middleware/check_login')

const { getNewsByUserId } = require('../../controller/news')

const { confirmFollow } = require('../../middleware/confirmFollow')

//  他人頁  0228
router.get('/other/:id', view_check_isMe, confirmFollow, Cache.getOtherCache, async (ctx, next) => {
    let id = ctx.params.id * 1
    let cache  = ctx.cache[PAGE.USER]
    let { exist, data } = cache
    
    if (exist === HAS_CACHE) {
        console.log(`@${PAGE.USER}/${id} 直接使用緩存304`)
        ctx.status = 304
    }else if(exist !== NO_IF_NONE_MATCH){
        let { data: { currentUser, fansList, idolList } } = await getRelationShipByUserId(id)
        let { data: blogList } = await getBlogListByUserId(id)
        data = cache.data = { currentUser, fansList, idolList, blogList }
    }
    let { currentUser, fansList, idolList, blogList } = data

    //  非文章作者，所以不傳入未公開的文章
    delete blogList.hidden

    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,

        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogList,       //  window.data 數據
        fansList,       //  window.data 數據
        idolList,       //  window.data 數據
    })
})

//  個人頁  0228
router.get('/self', view_check_login, Cache.getSelfCache, async (ctx, next) => {
    let { id } = ctx.session.user
    let cache  = ctx.cache[PAGE.USER]
    let { exist, data } = cache
    
    if (exist !== HAS_CACHE) {
        let { data: { currentUser, fansList, idolList } } = await getRelationShipByUserId(id)
        let { data: blogList } = await getBlogListByUserId(id)
        data = ctx.data = { currentUser, fansList, idolList, blogList }
    }

    let { currentUser, fansList, idolList, blogList } = data

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

//  登入頁  0228
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

//  註冊頁  0228
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