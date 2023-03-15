/**
 * @description API commond相關
 */
const { api_check_login } = require('../../middleware/check_login')         //  0228
const router = require('koa-router')()                                      //  0228
const Comment = require('../../controller/comment')                         //  0228
const { htmlStr_comments } = require('../../utils/ejs-render')              //  0228
const removeDeletedComment = require('../../utils/hiddenRemovedComments')   //  0228
const {
    CACHE: {
        TYPE: {
            API                                 //  0228
        },
        NO_CACHE,                               //  0228
        IF_NONE_MATCH_IS_NO_FRESH               //  0228
    }
} = require('../../conf/constant')
const Cache = require('../../middleware/cache') //  0228
router.prefix('/api/comment')

//  0228
router.get('/:blog_id', Cache.getCommentCache, async (ctx, next) => {
    const blog_id = ctx.params.blog_id * 1
    let cacheStatus = ctx.cache[API.COMMENT]
    //  向系統緩存撈資料 { exist: 緩存提取結果, data: resModel{ errno, data: 對應blogPage格式化的comments數據 } || undefined }
    let { exist, data: resModel } = cacheStatus
    let cacheKey = `${API.COMMENT}/${blog_id}`

    //  系統沒有緩存數據 || 請求攜帶的 if-None-Match 過期
    if (exist === NO_CACHE || exist === IF_NONE_MATCH_IS_NO_FRESH) {
        //  向 DB 提取數據
        const commentsResModel = await Comment.findCommentsByBlogId(blog_id)
        //  刪除已軟刪除的comments，且將數據轉換為pid->id的嵌套格式
        commentsResModel.data = removeDeletedComment(commentsResModel.data)
        //  將 數據賦予給 ctx.cache
        resModel = cacheStatus.data = commentsResModel
        console.log(`@ ${cacheKey} 完成 DB撈取`)
        //  適用 HAS_FRESH_CACHE, NO_IF_NONE_MATCH
    } else {
        console.log(`@ ${cacheKey} -> 使用系統緩存`)
    }
    //  複製 resModel
    let { errno, data: comments } = resModel
    //  生成 htmlString 的 comments 數據
    let commentsHtmlStr = await htmlStr_comments(comments)
    ctx.body = {
        errno,
        data: { comments, commentsHtmlStr }
    }
})
//  創建comment
router.post('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    ctx.body = await Comment.addComment(ctx.request.body)
})

router.delete('/', api_check_login, Cache.modifiedtCache, async (ctx, next) => {
    let { author_id, commenter_id, commentId, blog_id, p_id } = ctx.request.body
    ctx.body = await Comment.removeComment({ author_id, commenter_id, commentId, blog_id, p_id })
})





module.exports = router