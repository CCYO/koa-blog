/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const { getBlogList } =  require('../../controller/blog')

const { 
    findUserById, getFansById, getIdolsById, getNews, confirmFollow,
    getOther,
} = require('../../controller/user')

router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

router.get('/register', async (ctx, next) => {
    await ctx.render('register&login', {
        register: true,
        login: false
    })
})

router.get('/login', async (ctx, next) => {
    await ctx.render('register&login', {
        register: false,
        login: true
    })
})

//--
router.get('/other/:user_id', async (ctx, next) => {
    const { user_id: target_id } = ctx.params
    const { id: current_id } = ctx.session.user

    //  若是本人就跳轉
    if( target_id == current_id ){
        return ctx.redirect('/self')
    }

    //  清除Fan追蹤紀錄
    ctx.query.confirm && await confirmFollow(target_id, current_id)

    const { data: { user, blogs, fans, idols }}  = await getOther(target_id)
    
    let isFollow = fans.some(({id}) => current_id == id)
    console.log({ user, blogs, fans, idols , isFollow})
    await ctx.render('other', {
        user,
        blogs,
        fans,
        idols,
        isFollow,
    })
    return
})

//--
router.get('/self', view_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    // const { data: blogs } = await getBlogList(id, true)
    // //  取得 fansList
    // const { data: fans } = await getFansById(id)
    // //  取得 idolList
    // const { data: idols } = await getIdolsById(id)

    //  
    // const { data: { user, blogs, fans, idols }}  = await getOther(id)
    const { data: { fans, idols }}  = await getOther(id)
    //  取得 news
    const { data: { user, blogs, news} } = await getNews(id)

    console.log('blogs ===> => ', blogs)
    await ctx.render('self', {
        login: true,
        user,
        blogs,
        fans,
        idols,
        news
    })
})



router.get('/setting', view_check_login, async (ctx, next) => {
    console.log('@session.user => ', ctx.session.user)
    await ctx.render('setting', {
        user: ctx.session.user
    })
})

module.exports = router