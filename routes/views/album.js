let router = require('koa-router')()

const { findUser } = require('../../controller/user')
const { getBlogListByUserId, getBlog } = require('../../controller/blog')
const { transformFunctionListItemReply } = require('@redis/client/dist/lib/commands/generic-transformers')


router.prefix('/album')

router.get('/list/:user_id', async (ctx, next) => {
    let { user_id } = ctx.params
    let { data: { id, nickname }} = await findUser({id: user_id })
    let { data: blogList} = await getBlogListByUserId(user_id)
    console.log(blogList)
    let  { show, hidden } = blogList
    let list = show.reduce( (initVal, curArr) => {
        initVal = [ ...initVal, ...curArr ]
        return initVal
    }, [])
    if(ctx.session && ctx.session.user && ctx.session.user.id == user_id ){
        list = hidden.reduce( (initVal, curArr) => {
            initVal = [ ...initVal, ...curArr ]
            return initVal
        }, list)
    }
    console.log(list)
    await ctx.render('albumList', {
        title: '文章照片列表',
        albumList: {
            author: nickname,
            list
        }
    })
})

router.get('/:blog_id', async (ctx, next) => {
    let { blog_id } = ctx.params
    let { data: { id, title, imgs } } = await getBlog(blog_id * 1)
    let album = { 
        blog: { id, title },
        imgs
    }
    await ctx.render('album', { album, title })
})
module.exports = router