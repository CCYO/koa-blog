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
  ENV,
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
const commonCache = GEN_CACHE_FN.common(TYPE.PAGE.BLOG);
const { ErrRes, ErrModel } = require("../../model");
router.get("/blog/preview/:id", CHECK.login, privateCache, async (ctx) => {
  console.log("觸發previews ---> url: ", ctx.path);
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

  if (exist === STATUS.NO_CACHE) {
    //  向 DB 提取數據
    let resModel = await Blog.findWholeInfo({ blog_id });
    //  DB 沒有相符數據
    if (resModel.errno) {
      ctx.redirect(`/permission/${ErrRes.PAGE.NO_PAGE.errno}`);
      return;
    }
    console.log(`@ 從 DB 取得 ${cacheKey}`);
    //  將 DB 數據賦予給 ctx.cache
    cache.data = resModel.data;
    // cache.data.html = encodeURI(cache.data.html);
    cache.data.html = cache.data.html && encodeURI(cache.data.html);
    //  若html有值，則進行解碼
  }
  //  未公開
  if (!cache.data.show && ctx.session.user.id !== cache.data.author.id) {
    ctx.redirect(`/permission/${ErrRes.PAGE.NO_PAGE.errno}`);
    return;
  } else if (exist === STATUS.HAS_FRESH_CACHE) {
    console.log(`@ ${cacheKey} 響應 304`);
    ctx.status = 304;
  } else {
    console.log(`@ ${cacheKey} 響應 系統緩存數據`);
  }
  let ejs_data = {
    blog: { ...cache.data, showComment: false },
    ejs_template,
    isLogin: true,
    me_id: ctx.session.user.id,
  };
  return await ctx.render("blog", ejs_data);
});
//  編輯文章
router.get("/blog/edit/:id", CHECK.login, privateCache, async (ctx, next) => {
  console.log("觸發edit ---> url: ", ctx.path);
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
//  查看文章
router.get("/blog/:id", NEWS.confirm, commonCache, async (ctx, next) => {
  console.log("觸發blog ---> url: ", ctx.path);
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

  if (exist === STATUS.NO_CACHE) {
    //  向 DB 提取數據
    let resModel = await Blog.findWholeInfo({ blog_id });
    //  DB 沒有相符數據
    if (resModel.errno) {
      ctx.redirect(`/errPage?resModel=${JSON.stringify(resModel)}`);
      return;
      //  將html數據做百分比編碼，交由前端解碼
    }
    console.log(`@ 從 DB 取得 ${cacheKey}`);
    //  將 DB 數據賦予給 ctx.cache
    cache.data = resModel.data;
    // cache.data.html = encodeURI(cache.data.html);
    cache.data.html = cache.data.html && encodeURI(cache.data.html);
    //  若html有值，則進行解碼
  }
  //  未公開
  if (!cache.data.show) {
    ctx.redirect(`/permission/${ErrRes.PAGE.NO_PAGE.errno}`);
    return;
  } else if (exist === STATUS.HAS_FRESH_CACHE) {
    console.log(`@ ${cacheKey} 響應 304`);
    ctx.status = 304;
    return;
  } else {
    console.log(`@ ${cacheKey} 響應 系統緩存數據`);
  }
  let url = new URL(ctx.href);
  let showComment = true;
  let isLogin = ctx.session.user ? true : false;
  let me_id = isLogin ? ctx.session.user.id : 0;
  let ejs_data = {
    blog: { ...cache.data, showComment },
    ejs_template,
    isLogin,
    me_id,
  };
  return await ctx.render("blog", ejs_data);
});
module.exports = router;
