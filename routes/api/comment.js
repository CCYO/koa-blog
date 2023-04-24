/**
 * @description API commond相關
 */
//  0411    ----------------------------------------------------------------未整理
const { htmlStr_comments } = require('../../utils/ejs-render')
//  0411    ----------------------------------------------------------------未整理
const removeDeletedComment = require('../../utils/hiddenRemovedComments')
const Comment = require('../../controller/comment')                         //  0411
const Check = require('../../middleware/check_login')                       //  0411
const {
    //  0411
    CACHE: {
        //  0411
        TYPE: { API },
        //  0411 ---- 未整理
        NO_CACHE,
        IF_NONE_MATCH_IS_NO_FRESH               //  0228
    }
} = require('../../conf/constant')
//  0411    ----------------------------------------------------------------未整理
const Cache = require('../../middleware/cache')
const router = require('koa-router')()                                      //  0411
router.prefix('/api/comment')                                               //  0411
//  0411
router.delete('/', Check.api_logining,
    Cache.modifiedtCache,   //  ----------------------------------------------未整理 
    async (ctx, next) => {
        //  要多一個判斷，這請求有沒有刪除的資格 
        //  1. 作者 > 誰都可以山
        //  2. 留言者 > 山自己的
        ctx.body = await Comment.remove(ctx.request.body)
    })
//  0411
//  創建comment
router.post('/', Check.api_logining,
    Cache.getCommentCache, //  ----------------------------------------------未整理 
    async (ctx, next) => {
        ctx.body = await Comment.add(ctx.request.body)
    })
//  0411???
router.get('/:blog_id',
    Cache.getCommentCache, //  ----------------------------------------------未整理 
    async (ctx, next) => {
        const blog_id = ctx.params.blog_id * 1
        let cacheStatus = ctx.cache[API.COMMENT]
        //  向系統緩存撈資料 { exist: 緩存提取結果, data: resModel{ errno, data: 對應blogPage格式化的comments數據 } || undefined }
        let { exist, data: resModel } = cacheStatus
        let cacheKey = `${API.COMMENT}/${blog_id}`
        //  系統沒有緩存數據 || 請求攜帶的 if-None-Match 過期
        if (exist === NO_CACHE || exist === IF_NONE_MATCH_IS_NO_FRESH) {
            //  向 DB 提取數據
            const commentsResModel = await Comment.findInfoForPageOfBlog(blog_id)
            //  刪除已軟刪除的comments，且將數據轉換為pid->id的嵌套格式
            //  0411    ----------------------------------------------------------------未整理
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
        //  0411    ----------------------------------------------------------------未整理
        let commentsHtmlStr = await htmlStr_comments(comments)
        ctx.body = {
            errno,
            data: { comments, commentsHtmlStr }
        }
    })
module.exports = router