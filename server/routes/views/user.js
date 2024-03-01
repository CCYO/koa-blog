/**
 * @description Router/Views user
 */
const {
  VIEWS: { CHECK },
} = require("../../middleware");
const User = require("../../controller/user");
const ejs_template = require("../../utils/ejs_template");
const {
  DEFAULT: {
    BLOG,
    CACHE: { TYPE },
  },
} = require("../../config");

const router = require("koa-router")();
const privateCache = CHECK.private(TYPE.PAGE.USER);
const commonCache = CHECK.common(TYPE.PAGE.USER);

//  register page
router.get("/register", CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    title: "註冊",
    active: "register",
  });
});
//  login page
router.get("/login", CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    title: "登入",
    active: "login",
  });
});
//  個人頁
router.get("/self", privateCache, async (ctx) => {
  //  middleware/privateCache 取得的緩存數據
  //  ctx.cache[TYPE.PAGE.USER]
  //  { exist: 提取緩存數據的結果 ,
  //    data: { currentUser, fansList, idolList, blogList } || undefined }

  let opts = {
    cache: ctx.cache,
    user_id: ctx.session.user.id,
  };
  let { data } = await User.findDataForUserPage(opts);
  //  將 DB 數據賦予給 ctx.cache
  let { currentUser, relationShip, blogs } = (ctx.cache.data = data);
  await ctx.render("user", {
    ejs_template,
    pagination: BLOG.PAGINATION,
    isSelf: true,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});
//  他人頁
router.get("/other/:id", CHECK.isSelf, commonCache, async (ctx) => {
  //  從 middleware 取得的緩存數據 ctx.cache[PAGE.USER]
  /**
   * {
   ** exist: 提取緩存數據的結果 ,
   ** data: { currentUser, fansList, idolList, blogList } || undefined
   * }
   */
  // cache = { exist: STATUS.NO_CACHE, data: undefined };

  let opts = {
    cache: ctx.cache,
    user_id: ctx.params.id * 1,
  };
  let { data } = await User.findDataForUserPage(opts);
  //  將 DB 數據賦予給 ctx.cache
  let { currentUser, relationShip, blogs } = (ctx.cache.data = data);
  //  非文章作者，所以不傳入未公開的文章
  blogs = { public: blogs.public };
  await ctx.render("user", {
    ejs_template,
    pagination: BLOG.PAGINATION,
    isSelf: false,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});
//  設置頁
router.get("/setting", CHECK.login, async (ctx, next) => {
  let currentUser = ctx.session.user;
  //  不允許前端緩存
  ctx.set({
    ["Cache-Control"]: "no-store",
  });
  await ctx.render("setting", {
    title: `${currentUser.nickname}個人資料設置`,
    currentUser,
  });
});
//  0504
module.exports = router;
