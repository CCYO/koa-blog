/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const { getBlogListByUserId } = require('../../controller/blog')

const { getNewsByUserId } = require('../../controller/news')

const {
    getPeopleById,

    getFansById,
    getIdolsById,
    confirmFollow,
} = require('../../controller/user')

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
router.get('/self', view_check_login, async (ctx, next) => {
    let currentUser = ctx.session.user
    let id = currentUser.id

    let { data: newsList } = await getNewsByUserId(id)
    let { data: { fansList, idolList } } = await getPeopleById(id, true)
    let { data: blogList } = await getBlogListByUserId(id, true)
    console.log('@blogList => ', blogList)

    await ctx.render('self', {
        title: `${currentUser.nickname}的主頁`,
        //  導覽列數據
        logging: true,
        active: 'self',
        newsList, //  window.data 數據

        //  主要資訊數據
        isMyIdol: undefined, //  window.data 數據
        currentUser,
        blogList, //  window.data 數據

        //  次要資訊數據
        fansList, //  window.data 數據
        idolList, //  window.data 數據

        //  window.data 數據
        me: currentUser
    })
})

//  他人頁
router.get('/other/:id', async (ctx, next) => {
    let me = ctx.session.user
    let id = ctx.params.id * 1

    //  若是自己的ID，跳轉到個人頁面
    if (me && me.id === id) {
        return ctx.redirect('/self')
    }

    let newsList = {}
    if (me) {
        let { data } = await getNewsByUserId(me.id)
        newsList = data
    } else {
        me = {}
    }

    let { data: { currentUser, fansList, idolList } } = await getPeopleById(id)
    let { data: blogList } = await getBlogListByUserId(id)

    await ctx.render('self', {
        title: `${currentUser.nickname}的主頁`,
        //  導覽列數據
        logging: me.id ? true : false,
        active: 'other',
        newsList, //  window.data 數據

        //  主要資訊數據
        currentUser, //  window.data 數據
        isMyIdol: !me.id ? false : fansList.some((fans) => fans.id === me.id),
        blogList, //  window.data 數據

        //  次要資訊數據
        fansList, //  window.data 數據
        idolList, //  window.data 數據

        //  window.data 數據
        me
    })
})

//  個資更新頁
router.get('/setting', view_check_login, async (ctx, next) => {
    const { user: me } = ctx.session

    //  導覽列數據
    let { data: newsList } = await getNewsByUserId(me.id)

    await ctx.render('setting', {
        title: `${me.nickname}的個資`,
        //  導覽列數據
        newsList,
        logging: true,
        active: 'setting',

        //  window.data 數據
        me
    })
})

/**
 * @description router for square
 */
router.get('/square', view_check_login, async (ctx, next) => {
    await ctx.render('square')
})

router.get('/tt', async (ctx) => {
    throw new Error('這沙小拉')
    return await ctx.render('tt')
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