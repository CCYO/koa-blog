/**
 * @description Router/Views blog
 */

const ejs_template = require("../../utils/ejs_template");

//  0501
const {
  DEFAULT: {
    BLOG,
    CACHE: { TYPE, STATUS },
  },
} = require("../../config");
//  0501
const {
  VIEWS: { CHECK, NEWS },
  GEN_CACHE_FN,
} = require("../../middleware");
//  0406
const Blog = require("../../controller/blog");
//  0406
const router = require("koa-router")();
//  0504
const privateCache = GEN_CACHE_FN.private(TYPE.PAGE.BLOG);
//  0504
const commonCache = GEN_CACHE_FN.common(TYPE.PAGE.BLOG);

//  0406
//  查看文章
router.get("/blog/:id", NEWS.confirm, commonCache, async (ctx, next) => {
  const blog_id = ctx.params.id * 1;
  //  從 middleware 取得的緩存數據 ctx.cache[PAGE.BLOG]
  /**
   * {
   ** exist: 提取緩存數據的結果 ,
   ** data: blogIns || undefined
   * }
   */
  let cache = ctx.cache[TYPE.PAGE.BLOG];
  let { exist } = cache;
  let cacheKey = `${TYPE.PAGE.BLOG}/${blog_id}`;
  if (exist === STATUS.HAS_FRESH_CACHE) {
    console.log(`@ ${cacheKey} 響應 304`);
    ctx.status = 304;
  } else if (
    exist === STATUS.NO_IF_NONE_MATCH ||
    exist == STATUS.IF_NONE_MATCH_IS_NO_FRESH
  ) {
    console.log(`@ ${cacheKey} 響應 系統緩存數據`);
  } else {
    //  向 DB 提取數據
    let resModel = await Blog.findWholeInfo(blog_id);
    //  DB 沒有相符數據
    if (resModel.errno) {
      return await ctx.render("page404", resModel);
      //  將html數據做百分比編碼，交由前端解碼
    }
    console.log(`@ 從 DB 取得 ${cacheKey}`);
    //  將 DB 數據賦予給 ctx.cache
    cache.data = resModel.data;
    // cache.data.html = encodeURI(cache.data.html);
    cache.data.html = cache.data.html && encodeURI(cache.data.html);
    //  若html有值，則進行解碼
  }
  let url = new URL(ctx.href);
  let params = url.searchParams;

  let showComment =
    //  是否由預覽文章發來的請求
    !params.get(BLOG.SEARCH_PARAMS.PREVIEW) &&
    //  是否為發布狀態
    cache.data.show;
  let isLogin = ctx.session.user ? true : false;
  let me_id = isLogin ? ctx.session.user.id : 0;
  console.log("blog => ", cache.data.html);
  console.log(typeof cache.data.html);
  let ejs_data = {
    blog: { ...cache.data, showComment },
    ejs_template,
    isLogin,
    me_id,
  };
  return await ctx.render("blog", ejs_data);
});
//  ---------------------------------------------------------------------------------------------
//  編輯文章
router.get("/blog/edit/:id", CHECK.login, privateCache, async (ctx, next) => {
  const author_id = ctx.session.user.id;
  const blog_id = ctx.params.id * 1;
  //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
  let cacheStatus = ctx.cache[TYPE.PAGE.BLOG];
  let { exist } = cacheStatus;
  let cacheKey = `${TYPE.PAGE.BLOG}/${blog_id}`;
  //  系統沒有緩存數據
  if (exist === STATUS.NO_CACHE) {
    //  向 DB 撈取數據
    const resModel = await Blog.findWholeInfo({ blog_id, author_id });
    //  DB 沒有相符數據
    if (resModel.errno) {
      return await ctx.render("page404", resModel);
      //  將html數據做百分比編碼，交由前端解碼
    } else {
      console.log(`@ 從 DB 取得 ${cacheKey}`);
      //  將 DB 數據賦予給 ctx.cache
      cacheStatus.data = resModel.data;
      cacheStatus.data.html =
        cacheStatus.data.html && encodeURI(cacheStatus.data.html);
      //  若html有值，則進行解碼
    }
  } else {
    console.log(`@ ${cacheKey} -> 使用系統緩存`);
  }
  let blog = { ...cacheStatus.data, showComment: false };
  await ctx.render("blog-edit", { blog });
  return;
});
module.exports = router;
