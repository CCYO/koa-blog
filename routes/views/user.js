/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const { getBlogList } =  require('../../controller/blog')

const { 
    findUserById, getFansById, getIdolsById, getSelfInfo, getNews, getOtherInfo, confirmFollow,
    getOther,
} = require('../../controller/user')

/**
 * @description router for square
 */
 router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

/**
 * @description router for login
 */
router.get('/login', async (ctx, next) => {
    if(ctx.session.user){
        return ctx.redirect('/self')
    }

    await ctx.render('register&login', {
        logging: false,
        active: 'login'
    })
})

/**
 * @description router for register
 */
router.get('/register', async (ctx, next) => {
    if(ctx.session.user){
        return ctx.redirect('/self')
    }

    await ctx.render('register&login', {
        logging: false,
        active: 'register'
    })
})

/**
 * @description router for self
 */
router.get('/self', view_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: { news, more, index, count, comfirm_time } } = await getNews(id) 
    const { data: { author: user, blogs, fans, idols } } = await getSelfInfo(id)
    
    await ctx.render('self', {
        logging: true,
        active: undefined,
        self: true,
        user,
        blogs,
        fans,
        idols,
        news,
        more,
        index,
        count,
        comfirm_time
    })
})

/**
 * @description router for other
 */
router.get('/other/:user_id', async (ctx, next) => {
    const { user_id: target_id } = ctx.params
    const current_id = (ctx.session.user) ? ctx.session.user.id : undefined

    //  若是本人就跳轉至 /self
    if( target_id == current_id ){
        return ctx.redirect('/self')
    }

    //  若 query 有 confirm 參數，則清除Fan追蹤紀錄
    ctx.query.confirm && current_id && await confirmFollow(target_id, current_id)
    
    //  整理 news 資料
    let news = []
    
    const { data: { author: user, blogs, fans, idols } } = await getOtherInfo(target_id)

    let options = {
        logging: current_id ? true : false,
        self: false,
        active: undefined,
        user,
        blogs,
        fans,
        idols
    }

    if(!options.logging){
        options.myIdol = undefined
    }

    //  若有登入，則前往 db 取得 news 資料
    if(current_id){
        let { data: {news, more, index, count} } = await getNews(current_id)
        options = { ...options, news, more, index, count } 
        options.myIdol = fans.some(({id}) => id === current_id) ? true : false
    } 

    await ctx.render('self', options)
})

/**
 * @ router for setting
 */
router.get('/setting', view_check_login, async (ctx, next) => {
    const { user } = ctx.session
    const { data: { news } } = await getNews(user.id) 

    await ctx.render('setting', {
        logging: true,
        active: 'setting',
        user,
        news
    })
})

module.exports = router