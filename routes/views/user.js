/**
 * @description Router/Views user
 */
const Cache = require('../../middleware/cache') //  0228
const Check = require('../../middleware/check_login')
const router = require('koa-router')()          //  0228

//  個人頁  0324
router.get('/self', Check.view_logining, Cache.getSelfCache, async (ctx, next) => {
    let { id: userId } = ctx.session.user
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: { currentUser, fansList, idolList, blogList } || undefined }
    let cacheStatus = ctx.cache[PAGE.USER]
    let { exist, data: relationShip } = cacheStatus
    if (exist === NO_CACHE) {
        //  向 DB 撈取數據
        let resModel = await User.findInfoForUserPage(userId)
        if (resModel.errno) {
            return await ctx.render('page404', { ...resModel })
        }
        //  將 DB 數據賦予給 ctx.cache
        relationShip = cacheStatus.data = resModel.data
    }
    let { currentUser, fansList, idols, blogList } = relationShip
    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,
        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogList,       //  window.data 數據
        fansList,       //  window.data 數據
        idols,       //  window.data 數據
    })
})
//  0404
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
//  0404
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

const { confirmFollow } = require('../../middleware/confirmFollow')

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





//  他人頁  0324
router.get('/other/:id', Check.view_isSelf, confirmFollow, Cache.getOtherCache, async (ctx, next) => {
    let userId = ctx.params.id * 1
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: { currentUser, fansList, idolList, blogList } || undefined }
    let cacheStatus = ctx.cache[PAGE.USER]
    let { exist, data: relationShip } = cacheStatus
    let cacheKey = `${PAGE.USER}/${userId}`
    //  提取到有效的緩存數據
    if (exist === HAS_FRESH_CACHE) {
        console.log(`@ ${cacheKey} 響應 304`)
        ctx.status = 304
        //  在沒 if-None-Match 的情況下，取得到系統緩存數據
    } else if (exist === NO_IF_NONE_MATCH) {
        console.log(`@ ${cacheKey} 響應 系統緩存數據`)
        //  適用 NO_CACHE, IF_NO_MATCH_IS_NO_FRESH
    } else {
        //  向 DB 撈取數據
        let resModel = await User.findInfoForUserPage(userId)
        if (resModel.errno) {
            return await ctx.render('page404', { ...resModel })
        }
        //  將 DB 數據賦予給 ctx.cache
        relationShip = cacheStatus.data = resModel.data
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





//  個資更新頁  //  0228
router.get('/setting/:userId', Check.view_mustBeSelf, async (ctx, next) => {
    let currentUser = ctx.session.user
    //  不允許前端緩存
    ctx.set({
        ['Cache-Control']: 'no-store'
    })
    await ctx.render('setting', {
        title: `${currentUser.nickname}的個資`,
        //  window.data 數據
        currentUser
    })
})
module.exports = router