/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const { getBlogList } =  require('../../controller/blog')

const { isFans, findUserById, getFansById, getIdolsById, getNews, confirmFollow} = require('../../controller/user')

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

router.get('/self', view_check_login, async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: blogs } = await getBlogList(id)
    //  取得 fansList
    const { data: fans } = await getFansById(id)
    //  取得 idolList
    const { data: idols } = await getIdolsById(id)
    //  取得 news
    const { data: news } = await getNews(id)

    await ctx.render('self', {
        user: ctx.session.user,
        blogs,
        fans,
        idols,
        news
    })
})

router.get('/other/:user_id', async (ctx, next) => {
    const { user_id: target_id } = ctx.params
    const { id: current_id } = ctx.session.user
    if( target_id == current_id ){
        return ctx.redirect('/self')
    }
    ctx.query.confirm && await confirmFollow(target_id, current_id)

    const { data: user } = await findUserById(target_id)
    const { data: blogs } = await getBlogList(target_id)
    const { data: isFollow } = await isFans(current_id, target_id)
    const { data: fans } = await getFansById(target_id)
    const { data: idols } = await getIdolsById(target_id)
    await ctx.render('other', {
        blogs,
        user,
        isFollow,
        fans,
        idols
    })
})

router.get('/follow', async () => {
    const { id } = ctx.session.user
    const { follow_id } = ctx.request.body
    await followById(id, follow_id)
})

router.get('/setting', view_check_login, async (ctx, next) => {
    console.log('@session.user => ', ctx.session.user)
    await ctx.render('setting', {
        user: ctx.session.user
    })
})

module.exports = router