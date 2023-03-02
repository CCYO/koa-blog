/**
 * @description API commond相關
 */

const router = require('koa-router')()

const removeDeletedComment = require('../../utils/hiddenRemovedComments')
const Comment = require('../../controller/comment')
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

const {
    createComment,
    removeComment
} = require('../../controller/comment')



const { api_check_login } = require('../../middleware/check_login')

router.prefix('/api/comment')

router.get('/:blog_id', Cache.getCommentCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
    let cache = ctx.cache[API.COMMENT]
    let { exist, data: commentModel } = cache
    let cacheKey = `${API.COMMENT}/${blog_id}`
    if (exist === HAS_CACHE || exist === NO_IF_NONE_MATCH) {
        console.log(`@ ${cacheKey} -> 使用系統緩存`)
        let { errno, data } = commentModel
        data = removeDeletedComment(data)
        ctx.body = { errno, data }
    } else {
        const commentsRes = await Comment.getCommentsByBlogId(blog_id)
        // const commentRes = await Comment.getCommentsByBlogId(blog_id)
        commentModel = cache.data = commentsRes
        console.log(`@ ${cacheKey} 完成 DB撈取`)
    }
    let { errno, data } = commentModel
    data = removeDeletedComment(data)
    ctx.body = { errno, data }
    // let errno = data.errno
    //  隱藏已被軟刪除的comment
    // let commentsData = removeDeletedComment(data.data)

    // let comments = data
    // console.log('@comments => ', comments)
    // ctx.body = comments
})

//  創建comment
router.post('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    ctx.body = await createComment(ctx.request.body)
})

router.delete('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    let { commentId, blog_id } = ctx.request.body
    ctx.body = await removeComment({ commentId, blog_id })
})

module.exports = router