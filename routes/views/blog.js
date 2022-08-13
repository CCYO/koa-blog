/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { NEWS: { LIMIT } } = require('../../conf/constant')
const { view_check_login } = require('../../middleware/check_login')

const {
    getBlog
} = require('../../controller/blog')

const {
    getNewsByUserId
} = require('../../controller/news')


//  撰寫新文章
router.get('/blog/new', view_check_login, async (ctx, next) => {
    const { createdAt, updatedAt, ...me } = ctx.session.user
    const { data: newsList } = await getNewsByUserId(me.id)

    await ctx.render('blog-edit', {
        title: '編輯文章',
        //  導覽列數據
        logging: true,
        active: 'editor',
        newsList, //  window.data 數據

        //  主要資訊數據
        blog: { author: { ...me } },
        me      //  window.data 數據
    })
})

//  修改文章
router.get('/blog/edit/:blog_id', view_check_login, async (ctx, next) => {
    const { createdAt, updatedAt, ...me } = ctx.session.user
    const { blog_id } = ctx.params

    const { data: newsList } = await getNewsByUserId(me.id)    
    const { data: blog } = await getBlog(blog_id * 1)

    if (blog.author.id != me.id) {
        return ctx.redirect('/setting')
    }

    return await ctx.render('blog-edit', { 
        title: '編輯文章',
        //  導覽列數據
        logging: true,
        active: 'editor',
        newsList, //  window.data 數據

        //  主要資訊數據
        blog,   //  window.data 數據
        me      //  window.data 數據
    })
})

//  查看文章
router.get('/blog/:blog_id', async (ctx, next) => {
    let { user: me } = ctx.session
    const { blog_id } = ctx.params
    const { data: blog } = await getBlog(blog_id, true)

    //  導覽列數據
    let newsList = {}
    if (me) {
        let { data } = await getNewsByUserId(me.id)
        newsList = data
    } else {
        me = {}
    }
    
    return await ctx.render('blog', {
        title: blog.title,
        //  導覽列數據
        logging: me ? true : false,
        active: 'blog',
        newsList, //  window.data 數據

        //  主要資訊數據
        blog,   //  window.data 數據
        me      //  window.data 數據
    })

})

module.exports = router