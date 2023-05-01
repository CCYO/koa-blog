/**
 * @description Router/Views user
 */
//  0501
const { CACHE: { TYPE, STATUS } } = require('../../conf/constant')
//  0430
const { CACHE, CHECK, NEWS } = require('../../middleware/views')
//  未處理
const Check = require('../../middleware/check_login')                   //  0406
const router = require('koa-router')()                                  //  0406

//  他人頁  0324
router.get('/other/:id', CHECK.isSelf, NEWS.confirm, CACHE.USER.other, async (ctx, next) => {
    let user_id = ctx.params.id * 1
    //  從 middleware 取得的緩存數據 ctx.cache[PAGE.USER]
    /**
     * { 
     ** exist: 提取緩存數據的結果 ,
     ** data: { currentUser, fansList, idolList, blogList } || undefined
     * }
     */
    let cache = ctx.cache[TYPE.PAGE.USER]
    let { exist } = cache
    let cacheKey = `${TYPE.PAGE.USER}/${user_id}`
    if (exist === STATUS.HAS_FRESH_CACHE) {
        console.log(`@ ${cacheKey} 響應 304`)
        ctx.status = 304
    } else if (exist === STATUS.NO_IF_NONE_MATCH || exist == STATUS.IF_NONE_MATCH_IS_NO_FRESH) {
        console.log(`@ ${cacheKey} 響應 系統緩存數據`)
    } else {
        //  向 DB 撈取數據
        let resModel = await User.findInfoForUserPage(user_id)
        if (resModel.errno) {
            return await ctx.render('page404', { ...resModel })
        }
        //  將 DB 數據賦予給 ctx.cache
        cache.data = resModel.data
    }
    let { currentUser, fansList, idols, blogs } = cache.data
    //  非文章作者，所以不傳入未公開的文章
    delete blogs.hidden
    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,
        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogs,       //  window.data 數據
        fansList,       //  window.data 數據
        idols,       //  window.data 數據
    })
})
//  個人頁  0324
router.get('/self', CHECK.login, CACHE.USER.self, async (ctx, next) => {
    let { id: user_id } = ctx.session.user
    //  從 middleware 取得的緩存數據 ctx.cache[TYPE.PAGE.USER]
    /**
     * { 
     ** exist: 提取緩存數據的結果 ,
     ** data: { currentUser, fansList, idolList, blogList } || undefined
     * }
     */
    ctx.cache
    let cache = ctx.cache[TYPE.PAGE.USER]
    let { exist, data: relationShip } = cache
    if (exist === STATUS.NO_CACHE) {
        //  向 DB 撈取數據
        let resModel = await User.findInfoForUserPage(user_id)
        if (resModel.errno) {
            return await ctx.render('page404', { ...resModel })
        }
        //  將 DB 數據賦予給 ctx.cache
        relationShip = cache.data = resModel.data
    }
    let { currentUser, fansList, idols, blogs } = relationShip
    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,
        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogs,       //  window.data 數據
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



const User = require('../../controller/user')   //  0228











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