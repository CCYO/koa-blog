/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login, view_check_isMe } = require('../../middleware/check_login')

const { getBlogListByUserId } = require('../../controller/blog')

const { getNewsByUserId } = require('../../controller/news')

const {
    getPeopleById
} = require('../../controller/user')

const { cacheUser, cacheSelf } = require('../../middleware/cache')

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
router.get('/self', view_check_login, cacheSelf, async (ctx, next) => {
    let id = ctx.session.user.id

    let { data: { currentUser, fansList, idolList } } = await getPeopleById(id)
    let { data: blogList } = await getBlogListByUserId(id)
    ctx.user[1] =  { currentUser, fansList, idolList, blogList }
    console.log('@blog => ', blogList.hidden)
    console.log('@currentUser => ', currentUser)

    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,

        //  主要資訊數據
        currentUser,    //  window.data 數據
        blogList,       //  window.data 數據
        fansList,       //  window.data 數據
        idolList,       //  window.data 數據
    })
})

//  他人頁
router.get('/other/:id', view_check_isMe, cacheUser, async (ctx, next) => {
    
    

    if (!ctx.user.kv) {
        console.log('@近來了')
        const { id } = ctx.params
        let { data: { currentUser, fansList, idolList } } = await getPeopleById(id)
        let { data: blogList } = await getBlogListByUserId(id)
        ctx.user = []
        ctx.user[1] =  { currentUser, fansList, idolList, blogList }
        delete ctx.user[1].blogList.hidden
    }else{
        let data = ctx.user.kv[1]
        ctx.user = []
        ctx.user[1] = data 
    }

    let { currentUser, fansList, idolList, blogList } = ctx.user[1]

    await ctx.render('user', {
        title: `${currentUser.nickname}的主頁`,

        //  主要資訊數據
        currentUser, //  window.data 數據
        blogList, //  window.data 數據
        fansList, //  window.data 數據
        idolList //  window.data 數據
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