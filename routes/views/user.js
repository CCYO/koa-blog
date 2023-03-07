/**
 * @description Router/Views user
 */
const { confirmFollow } = require('../../middleware/confirmFollow')


const router = require('koa-router')()          //  0228
const Blog = require('../../controller/blog')   //  0228
const User = require('../../controller/user')   //  0228

const {
    CACHE: {
        TYPE: {
            PAGE                                //  0228
        },
            HAS_FRESH_CACHE,                    //  0228
            NO_CACHE,                           //  0228
            NO_IF_NONE_MATCH                    //  0228
    } } = require('../../conf/constant')
const Cache = require('../../middleware/cache') //  0228
const {
    view_check_isMe,    //  0228
    view_check_login    //  0228
} = require('../../middleware/check_login')



//  他人頁  0228
router.get('/other/:id', view_check_isMe, confirmFollow, Cache.getOtherCache, async (ctx, next) => {
    let user_id = ctx.params.id * 1
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: { currentUser, fansList, idolList, blogList } || undefined }
    let cacheStatus  = ctx.cache[PAGE.USER]
    let { exist, data: relationShip } = cacheStatus
    let cacheKey = `${PAGE.USER}/${user_id}`
    //  提取到有效的緩存數據
    if (exist === HAS_FRESH_CACHE) {
        console.log(`@ ${cacheKey} 響應 304`)
        ctx.status = 304
        //  在沒 if-None-Match 的情況下，取得到系統緩存數據
    }else if(exist === NO_IF_NONE_MATCH){
        console.log(`@ ${cacheKey} 響應 系統緩存數據`)
        //  適用 NO_CACHE, IF_NO_MATCH_IS_NO_FRESH
    }else {
        //  向 DB 撈取數據
        let resModel = await User.findRelationShipByUserId(user_id)
        //  DB 沒有相符數據
        if(resModel.errno){
            return await ctx.render('page404', {...resModel})
        }
        let { data: { currentUser, fansList, idolList }} = resModel
        //  向 DB 撈取數據
        let { data: blogList } = await Blog.getBlogListByUserId(user_id)
        
        //  將 DB 數據賦予給 ctx.cache
        relationShip = cacheStatus.data = { currentUser, fansList, idolList, blogList }
    }
    let { currentUser, fansList, idolList, blogList } = relationShip
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
    let { id: user_id } = ctx.session.user
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: { currentUser, fansList, idolList, blogList } || undefined }
    let cacheStatus  = ctx.cache[PAGE.USER]
    let { exist, data: relationShip } = cacheStatus
    
    if (exist === NO_CACHE) {
        //  向 DB 撈取數據
        let resModel = await User.findRelationShipByUserId(user_id)
        //  DB 沒有相符數據
        if(resModel.errno){
            return await ctx.render('page404', {...resModel})
        }
        let { data: { currentUser, fansList, idolList }} = resModel
        //  向 DB 撈取數據
        let { data: blogList } = await Blog.getBlogListByUserId(user_id)
        //  將 DB 數據賦予給 ctx.cache
        relationShip = cacheStatus.data = { currentUser, fansList, idolList, blogList }
    }
    let { currentUser, fansList, idolList, blogList } = relationShip
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