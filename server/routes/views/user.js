/**
 * @description Router/Views user
 */
const ejs_template = require("../../utils/ejs_template");
//  0516
const {
  VIEWS: { CHECK, NEWS },
  GEN_CACHE_FN,
} = require("../../middleware");
//  0504
const User = require("../../controller/user");
//  0501
const {
  DEFAULT: {
    BLOG,
    CACHE: { TYPE, STATUS },
  },
} = require("../../config");
//  0504
const privateCache = GEN_CACHE_FN.private(TYPE.PAGE.USER);
//  0504
const commonCache = GEN_CACHE_FN.common(TYPE.PAGE.USER);
//  0516
const router = require("koa-router")();

//  0516
//  個資更新頁
router.get("/setting", CHECK.login, CHECK.mustBeOwner, async (ctx, next) => {
  let currentUser = ctx.session.user;
  //  不允許前端緩存
  ctx.set({
    ["Cache-Control"]: "no-store",
  });
  await ctx.render("setting", {
    title: `${currentUser.nickname}的個資`,
    //  window.data 數據
    currentUser,
  });
});
//  ------------------------------------------------------------------------------------
//  登入頁
router.get("/login", async (ctx, next) => {
  //  若已登入，跳轉到個人頁面
  if (ctx.session.user) {
    return ctx.redirect("/self");
  }
  await ctx.render("register&login", {
    title: "LOGIN",
    //  導覽列數據
    logging: false,
    //  導覽列數據 & 卡片Tab 數據
    active: "login",
  });
});
//  註冊頁
router.get("/register", async (ctx, next) => {
  //  若已登入，跳轉到個人頁面
  if (ctx.session.user) {
    return ctx.redirect("/self");
  }
  await ctx.render("register&login", {
    title: "REGISTER",
    //  導覽列數據
    logging: false,
    //  導覽列數據 & 卡片Tab 數據
    active: "register",
  });
});
//  個人頁
router.get("/self", CHECK.login, privateCache, async (ctx, next) => {
  let { id: user_id } = ctx.session.user;
  //  middleware/privateCache 取得的緩存數據
  //  ctx.cache[TYPE.PAGE.USER]
  //  { exist: 提取緩存數據的結果 ,
  //    data: { currentUser, fansList, idolList, blogList } || undefined }
  let cache = ctx.cache[TYPE.PAGE.USER];
  if (cache.exist === STATUS.NO_CACHE) {
    let resModel = await User.findInfoForUserPage(user_id);
    if (resModel.errno) {
      return await ctx.render("page404", { ...resModel });
    }
    //  將 DB 數據賦予給 ctx.cache
    cache.data = resModel.data;
  }
  let { currentUser, relationShip, blogs } = cache.data;
  await ctx.render("user", {
    ejs_template,
    pagination: BLOG.PAGINATION,
    isSelf: user_id === currentUser.id,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});
//  他人頁
router.get(
  "/other/:id",
  CHECK.isSelf,
  NEWS.confirm,
  commonCache,
  async (ctx, next) => {
    let user_id = ctx.params.id * 1;
    //  從 middleware 取得的緩存數據 ctx.cache[PAGE.USER]
    /**
     * {
     ** exist: 提取緩存數據的結果 ,
     ** data: { currentUser, fansList, idolList, blogList } || undefined
     * }
     */
    // cache = { exist: STATUS.NO_CACHE, data: undefined };
    let cache = ctx.cache[TYPE.PAGE.USER];
    let cacheKey = `${TYPE.PAGE.USER}/${user_id}`;
    if (cache.exist === STATUS.NO_CACHE) {
      //  向 DB 撈取數據
      let resModel = await User.findInfoForUserPage(user_id);
      if (resModel.errno) {
        return await ctx.render("page404", { ...resModel });
      }
      //  將 DB 數據賦予給 ctx.cache
      cache.data = resModel.data;
    } else if (exist === STATUS.HAS_FRESH_CACHE) {
      console.log(`@ ${cacheKey} 響應 304`);
      ctx.status = 304;
    } else {
      console.log(`@ ${cacheKey} 響應 系統緩存數據`);
    }
    let { currentUser, relationShip, blogs } = cache.data;
    //  非文章作者，所以不傳入未公開的文章
    blogs = { public: blogs.public };
    let isSelf = ctx.session && ctx.session.user.id === user_id;
    await ctx.render("user", {
      ejs_template,
      pagination: BLOG.PAGINATION,
      isSelf,
      title: `${currentUser.nickname}的主頁`,
      //  主要資訊數據
      currentUser, //  window.data 數據
      blogs, //  window.data 數據
      relationShip,
    });
  }
);
//  0504
module.exports = router;
