/**
 * @description API commond相關
 */

const router = require('koa-router')()

const Comment = require('../../controller/comment') //  0228

const {
    htmlStr_comments    //  0228
} = require('../../utils/ejs-render')

const removeDeletedComment = require('../../utils/hiddenRemovedComments')   //  0228

const {
    CACHE: {
        TYPE: {
            API             //  0228
        },
        HAS_CACHE,          //  0228
        NO_IF_NONE_MATCH    //  0228
    }
} = require('../../conf/constant')

const Cache = require('../../middleware/cache') //  0228

const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

//  0228
router.get('/:blog_id', Cache.getCommentCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
    let cache = ctx.cache[API.COMMENT]
    let { exist, data: commentModel } = cache
    let cacheKey = `${API.COMMENT}/${blog_id}`
    if (exist === HAS_CACHE || exist === NO_IF_NONE_MATCH) {
        console.log(`@ ${cacheKey} -> 使用系統緩存`)
    } else {
        const commentsRes = await Comment.getCommentsByBlogId(blog_id)
        commentModel = cache.data = commentsRes
        console.log(`@ ${cacheKey} 完成 DB撈取`)
    }
    let { errno, data } = commentModel
    let comments = removeDeletedComment(data)
    let commentsHtmlStr = await htmlStr_comments(comments)

    ctx.body = { errno, data: { comments, commentsHtmlStr} }
})

//  創建comment
router.post('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    ctx.body = await Comment.createComment(ctx.request.body)
})

router.delete('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    let { commentId, blog_id } = ctx.request.body
    ctx.body = await Comment.removeComment({ commentId, blog_id })
})

module.exports = router