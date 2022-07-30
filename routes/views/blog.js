/**
 * @description Router/Views blog
 */

const router = require('koa-router')()

const { NEWS: { LIMIT}} = require('../../conf/constant')
const { view_check_login } = require('../../middleware/check_login')

const {
    getBlog,

    getBlogList,
    confirmFollowBlog
} = require('../../controller/blog')

const {
    getNewsByUserId
} = require('../../controller/news')


//  撰寫新文章
router.get('/blog/new', view_check_login, async (ctx, next) => {
    const { createdAt, updatedAt, ...user } = ctx.session.user
    await ctx.render('blog-edit', {
        user: ctx.session.user,
        blog: { author: { ...user } }
    })
})

//  修改文章
router.get('/blog/edit/:blog_id', view_check_login, async (ctx, next) => {
    const { blog_id } = ctx.params
    const { id } = ctx.session.user
    const { errno, data: blog = undefined, msg } = await getBlog(blog_id * 1)

    if (errno) {
        return ctx.throw({ errno, msg })
    }

    if (blog.author.id != id) {
        return ctx.redirect('/setting')
    }

    return await ctx.render('blog-edit', { blog })
})

//  查看文章
router.get('/blog/:blog_id', async (ctx, next) => {
    let { user: me } = ctx.session
    const { blog_id } = ctx.params
    const { errno, data: blog, msg } = await getBlog(blog_id, true)

    //  導覽列數據
    let newsList = undefined
    if (me) {
        let res = await getNewsByUserId(me.id)
        newsList = { ...res.data, limit: LIMIT}
    }

    if (errno) {
        return ctx.body = msg
    } else {
        return await ctx.render('blog', {
            logging: me ? true : false,
            active: undefined,
            newsList,

            blog, me
        })
    }
})

router.get('/blog-list', async (ctx, next) => {
    const { id } = ctx.session.user
    const { data: blogs } = await getBlogList(id)
    await ctx.render('blog-list', {
        blogs
    })
})


module.exports = router