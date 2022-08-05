/**
 * @description Router/Views user
 */

const router = require('koa-router')()

const { view_check_login } = require('../../middleware/check_login')

const { getBlogListByUserId } = require('../../controller/blog')

const { getNewsByUserId } = require('../../controller/news')

const {
    getSelfInfo,

    getPeopleById,

    findUserById, getFansById, getIdolsById, getNews, getOtherInfo, confirmFollow,
    getOther,
} = require('../../controller/user')

/**
 * @description router for login
 */
router.get('/login', async (ctx, next) => {
    if (ctx.session.user) {
        return ctx.redirect('/self')
    }

    await ctx.render('register&login', {
        //  導覽列數據
        logging: false,
        //  導覽列數據 & 卡片Tab 數據
        active: 'login'
    })
})

/**
 * @description router for register
 */
router.get('/register', async (ctx, next) => {
    if (ctx.session.user) {
        return ctx.redirect('/self')
    }

    await ctx.render('register&login', {
        //  導覽列數據
        logging: false,
        //  導覽列數據 & 卡片Tab 數據
        active: 'register'
    })
})

//  使用者資訊
router.get('/other/:user_id', async (ctx, next) => {
    let me = ctx.session.user
    let user_id = ctx.params.user_id * 1

    if (me && me.id === user_id) {
        return ctx.redirect('/self')
    }

    let newsList = {}
    if (me) {
        let { data } = await getNewsByUserId(me.id)
        newsList = data
    } else {
        me = {}
    }

    let { data: { currentUser, fansList, idolList } } = await getPeopleById(user_id)
    let { data: blogList } = await getBlogListByUserId(user_id)

    await ctx.render('self', {
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

//  個人資訊
router.get('/self', view_check_login, async (ctx, next) => {
    console.log('@path => ', ctx.request.href)
    let { id } = ctx.session.user
    let { data: { currentUser, fansList, idolList } } = await getPeopleById(id)
    let { data: blogList } = await getBlogListByUserId(id, true)
    //  導覽列數據
    let { data: newsList } = await getNewsByUserId(id)
    console.log('@ newsList => ', newsList)
    console.log('@ newsList.newsList.unconfirm => ', newsList.newsList.unconfirm)


    await ctx.render('self', {
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

/**
 * @ router for setting
 */
router.get('/setting', view_check_login, async (ctx, next) => {
    const { user: me } = ctx.session

    //  導覽列數據
    let { data: newsList } = await getNewsByUserId(me.id)

    await ctx.render('setting', {
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

module.exports = router