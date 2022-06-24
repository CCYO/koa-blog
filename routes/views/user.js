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
    // const { data: { news, more, count, checkTime, index } }  = await getNews(id) 
    // const { data: { author: user, blogs, fans, idols } } = await getSelfInfo(id)
    const { data } = await getSelfInfo(id)
    return ctx.body = { data }
    /**
     * self.ejs
     ** user
     **** avatar: url
     **** email: str
     **** nickname: str
     ** blogs
     **** show: [{id, title}, ...]
     **** hidden: [{id, title}, ...]
     ** idols
     **** id: num
     **** avatar: url
     ** fans
     **** id: num
     **** avatar: url
     ** self: boo
     ** myIdol: boo

     * navbar.ejs
     ** logging: boo
     ** active : 'register' || 'login' || 'setting' || undefined
     ** news.ejs
     **** firstRender: boo v
     **** checkTime: num v
     **** count: num v
     **** news: { unconfirm: arr, confirm: arr }
     **** news.un?confirm.item: { news_id, confirm, showAt, fans_id, nickname }
     **** news.un?confirm.item: { news_id, confirm, showAt, blog_id, title, author }
     **** more: boo v
     **** index: num v
     * 
     */
    //, { firstRender, checkTime, existNews, count, news, more }
    await ctx.render('self', {
        user,
        blogs,
        fans,
        idols,
        self: true,
        //  myIdol 在 self:true 不需要

        logging: true,
        active: undefined,
        
        firstRender: true,
        checkTime,
        count,
        news,
        more,
        index  
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