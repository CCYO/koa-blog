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

router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

router.get('/register', async (ctx, next) => {
    await ctx.render('register&login', {
        logging: false,
        register: true,
        login: false
    })
})

router.get('/login', async (ctx, next) => {
    await ctx.render('register&login', {
        logging: false,
        register: false,
        login: true
    })
})

//--
router.get('/self', view_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: { news } } = await getNews(id) 
    const { data: { author: user, blogs, fans, idols } } = await getSelfInfo(id)

    await ctx.render('self', {
        logging: true,
        self: true,
        user,
        blogs,
        fans,
        idols,
        news
    })
})

router.get('/other/:user_id', async (ctx, next) => {
    const { user_id: target_id } = ctx.params
    const current_id = (ctx.session.user) ? ctx.session.user.id : false
    let logging = current_id ? true : false

    //  若是本人就跳轉
    if( target_id == current_id ){
        return ctx.redirect('/self')
    }

    //  清除Fan追蹤紀錄
    ctx.query.confirm && await confirmFollow(target_id, current_id)
    
    //  取得 news
    let news = []
    
    if(current_id){
        let { data } = await getNews(current_id)
        news = data.news
    } 

    const { data: { author: user, blogs, fans, idols } } = await getOtherInfo(target_id)

    await ctx.render('self', {
        logging,
        self: false,
        user,
        blogs,
        fans,
        idols,
        news
    })
})


router.get('/setting', view_check_login, async (ctx, next) => {
    const { user } = ctx.session
    const { data: { news } } = await getNews(user.id) 

    await ctx.render('setting', {
        logging: true,
        user,
        news
    })
})

module.exports = router