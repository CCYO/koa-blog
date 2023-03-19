let router = require('koa-router')()

const { BLOG } = require('../../conf/constant')
const Album = require('../../controller/album')
const Blog = require('../../controller/blog')

router.prefix('/album')
//  0318
router.get('/list/:user_id', async (ctx, next) => {
    let user_id = ctx.params.user_id * 1
    let isAuthor = false
    if (ctx.session.user && ctx.session.user.id === user_id) {
        isAuthor = true
    }
    let res = await Album.findAlbumList(user_id, isAuthor)
    let { errno, data } = res
    if (errno) {
        return ctx.render('page404', res)
    }
    let { user, albumList } = data
    if (!isAuthor) {
        delete albumList[BLOG.ORGANIZED.TYPE.NEGATIVE]
    }
    await ctx.render('albumList', {
        isAuthor,
        title: '文章照片列表',
        user,
        albumList
    })
})
//  0318
router.get('/:blog_id', async (ctx, next) => {
    let blog_id = ctx.params.blog_id * 1
    let res = await Blog.findBlog(blog_id)
    let { errno, data } = res
    if (errno) {
        await ctx.render('page404', res)
    }
    let { id, title, imgs } = data
    await ctx.render('album', {
        title,
        album: {
            blog: { id, title },
            imgs
        }
    })
})
module.exports = router