const User = require('../../controller/user')
const { BLOG } = require('../../conf/constant')     //  0411
const Blog = require('../../controller/blog')       //  0411
let router = require('koa-router')()                //  0411
router.prefix('/album')                             //  0411
//  0411
router.get('/list/:author_id', async (ctx, next) => {
    let author_id = ctx.params.author_id * 1
    let pagination = ctx.query
    let isAuthor = false
    if (ctx.session.user && ctx.session.user.id === author_id) {
        isAuthor = true
    }
    let resModel = await User.findAlbumListOfUser(author_id, pagination)
    if(resModel.errno){
        await ctx.render('page404', resModel)
        return
    }
    let { data: { author, albums } } = resModel
    if (!isAuthor) {
        delete albums[BLOG.ORGANIZED.TYPE.NEGATIVE]
    }
    await ctx.render('albumList', {
        isAuthor,
        title: '文章照片列表',
        author,
        albums
    })
})
//  0411
router.get('/:blog_id', async (ctx, next) => {
    let blog_id = ctx.params.blog_id * 1
    let res = await Blog.findWholeInfo(blog_id)
    let { errno, data } = res
    if (errno) {
        await ctx.render('page404', res)
    }
    let { id, title, imgs } = data
    console.log('data => ', data)
    await ctx.render('album', {
        title,
        album: {
            blog: { id, title },
            imgs
        }
    })
})
module.exports = router