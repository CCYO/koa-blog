/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { NEWS: { LIMIT } } = require('../../conf/constant')
const { view_check_login } = require('../../middleware/check_login')
const { cacheBlog } = require('../../middleware/cache')

const {
    getBlog
} = require('../../controller/blog')

const {
    getNewsByUserId
} = require('../../controller/news')


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

//  修改文章
router.get('/blog/edit/:blog_id', view_check_login, async (ctx, next) => {
    const { createdAt, updatedAt, ...me } = ctx.session.user
    const { blog_id } = ctx.params

    const { data: { blog } } = await getBlog(blog_id * 1)

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
router.get('/blog/:blog_id', cacheBlog, async (ctx, next) => {
    let me = ctx.session.user ? ctx.session.user : {}
    
    const { blog_id } = ctx.params
    const { data: {blog, etag} } = await getBlog(blog_id, true)
    console.log('@comment => ', blog.comments)
    ctx.set({
        etag,
        ['Cache-Control']: 'no-cache'
    })
    return await ctx.render('blog', {
        title: blog.title,
        //  導覽列數據
        // logging: me.id ? true : false,
        active: 'blog',

        //  主要資訊數據
        blog   //  window.data 數據
    })

})

module.exports = router