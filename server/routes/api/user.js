/**
 * @description API user相關
 */
const router = require("koa-router")();
const {
  API: { VALIDATE, SESSION, CHECK, CACHE, FIREBASE },
} = require("../../middleware");
const User = require("../../controller/user");
router.prefix("/api/user");

//  confirm news/idolFans
router.get("/confirm/:idolFans_id", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    idol_id: ctx.session.user.id,
    idolFans_id: ctx.params.idolFans_id * 1,
  };
  ctx.body = await User.confirmNews(opts);
});
//  modify setting info
router.patch(
  "/",
  CHECK.login,
  SESSION.reset,
  CACHE.modify,
  FIREBASE.user,
  VALIDATE.USER,
  async (ctx) => {
    ctx.body = await User.modifyInfo(ctx.request.body);
  }
);
//  check current password
router.post("/confirmPassword", CHECK.login, async (ctx, next) => {
  let opts = {
    email: ctx.session.user.email,
    password: ctx.request.body.origin_password,
  };
  ctx.body = await User.checkOriginPassword(opts);
});
//  cancel follow
router.post("/cancelFollow", CHECK.login, CACHE.modify, async (ctx, next) => {
  let opts = {
    idol_id: ctx.request.body.id,
    fans_id: ctx.session.user.id,
  };
  ctx.body = await User.cancelFollow(opts);
});
//  follow
router.post("/follow", CHECK.login, CACHE.modify, async (ctx, next) => {
  let opts = {
    idol_id: ctx.request.body.id,
    fans_id: ctx.session.user.id,
  };
  ctx.body = await User.follow(opts);
});
//  check email has been registered
router.post("/isEmailExist", VALIDATE.USER, async (ctx, next) => {
  ctx.body = await User.isEmailExist(ctx.request.body.email);
});
//  register
router.post("/register", VALIDATE.USER, async (ctx, next) => {
  ctx.body = await User.register(ctx.request.body);
});
//  login
router.post("/", SESSION.set, VALIDATE.USER, async (ctx, next) => {
  ctx.body = await User.login(ctx.request.body);
});
//  logout
router.get("/logout", CHECK.login, SESSION.remove);

module.exports = router;
