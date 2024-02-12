/**
 * @description API commond相關
 */
//  0504
const {
  GEN_CACHE_FN,
  API: { CACHE, CHECK },
} = require("../../middleware");
//  0411    ----------------------------------------------------------------未整理
const { commentsToHtml } = require("../../utils/ejs-render");
//  0411    ----------------------------------------------------------------未整理
const removeDeletedComment = require("../../utils/hiddenRemovedComments");
const Comment = require("../../controller/comment"); //  0411
const {
  DEFAULT: {
    //  0411
    CACHE: {
      //  0503
      STATUS,
      //  0411
      TYPE,
    },
  },
} = require("../../config");
const router = require("koa-router")(); //  0411
router.prefix("/api/comment"); //  0411
//  0504
const commonCaChe = GEN_CACHE_FN.common(TYPE.API.COMMENT);
//  0503
router.get("/:id", commonCaChe, async (ctx, next) => {
  const blog_id = ctx.params.id * 1;
  let cache = ctx.cache[TYPE.API.COMMENT];
  //  向系統緩存撈資料 { exist: 緩存提取結果, data: resModel{ errno, data: 對應blogPage格式化的comments數據 } || undefined }
  let { exist, data: resModel } = cache;
  let cacheKey = `${TYPE.API.COMMENT}/${blog_id}`;
  //  系統沒有緩存數據
  if (exist === STATUS.NO_CACHE) {
    //  向 DB 提取數據
    resModel = await Comment.findInfoForPageOfBlog(blog_id);
    //  刪除已軟刪除的comments，且將數據轉換為pid->id的嵌套格式
    resModel.data = removeDeletedComment(resModel.data);
    //  將 數據賦予給 ctx.cache
    cache.data = resModel;
    console.log(`@ ${cacheKey} 完成 DB撈取`);
  } else {
    console.log(`@ ${cacheKey} -> 使用系統緩存`);
  }
  //  複製 resModel
  let { errno, data: comments } = resModel;
  //  生成 htmlString 的 comments 數據
  //  0411    ----------------------------------------------------------------未整理
  // let commentsHtmlStr = await commentsToHtml(comments)
  ctx.body = {
    errno,
    data: {
      comments,
      //  commentsHtmlStr
    },
  };
});
//  0411
router.delete("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  //  要多一個判斷，這請求有沒有刪除的資格
  //  1. 作者 > 誰都可以山
  //  2. 留言者 > 山自己的
  ctx.body = await Comment.remove(ctx.request.body);
  //  await Comment.findDeletedItem(ctx.request.body);
});
//  --------------------------------------------------------------------------------------
//  創建comment
router.post("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  ctx.body = await Comment.add(ctx.request.body);
});

module.exports = router;
