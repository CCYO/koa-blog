/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { NEWS: { LIMIT } } = require('../../conf/constant')
const { view_check_login } = require('../../middleware/check_login')
const { cacheBlogView } = require('../../middleware/cache')

const {
    getBlog
} = require('../../controller/blog')

const {
    getNewsByUserId
} = require('../../controller/news')

const { renderFile } = require('../../utils/ejs')


//  撰寫新文章
router.get('/blog/new', view_check_login, async (ctx, next) => {
    const { createdAt, updatedAt, ...me } = ctx.session.user

    await ctx.render('blog-edit', {
        title: '撰寫新文章',
        //  導覽列數據
        logging: true,
        active: 'editor',

        //  主要資訊數據
        blog: { author: { ...me } }, //  window.data 數據
        me      //  window.data 數據
    })
})

//  編輯文章
router.get('/blog/edit/:blog_id', view_check_login, async (ctx, next) => {
    const { createdAt, updatedAt, ...me } = ctx.session.user
    const { blog_id } = ctx.params

    const { data: {blog} } = await getBlog(blog_id * 1)

    if (blog.author.id != me.id) {
        return ctx.body = '你哪位?'
    }

    return await ctx.render('blog-edit', { 
        title: '編輯文章',
        //  導覽列數據
        logging: true,
        active: 'editor',

        //  主要資訊數據
        blog,   //  window.data 數據
        me      //  window.data 數據
    })
})

//  查看文章
router.get('/blog/:blog_id', cacheBlogView, async (ctx, next) => {
    let me = ctx.session.user ? ctx.session.user : {}
    let api = []
    let view = []
    if(!ctx.blog){
        const { blog_id } = ctx.params
        const resModel = await getBlog(blog_id, true)
        let blog = api[1] = resModel.data.blog
        view[1] = await renderFile('blog', {
            title: blog.title,
            //  主要資訊數據
            blog   //  window.data 數據
        })
    }else{
        view = ctx.blog.view
    }
    ctx.blog = { api, view }
    ctx.body = view[1]
})

module.exports = router