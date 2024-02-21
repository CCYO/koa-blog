/**
 * @description API user相關
 */
const router = require("koa-router")();
const {
  API: { VALIDATE, SESSION, CHECK, CACHE, FIREBASE },
} = require("../../middleware");
const User = require("../../controller/user");
const { MyErr, ErrRes } = require("../../model");

router.prefix("/api/user");
//  confirm news/idolFans
router.get("/confirm/:idolFans_id", CHECK.login, CACHE.modify, async (ctx) => {
  let resModel = await User.confirmNews({
    idol_id: ctx.session.user.id,
    idolFans_id: ctx.params.idolFans_id * 1,
  });
  ctx.body = resModel;
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
  let { email } = ctx.session.user;
  let { origin_password: password } = ctx.request.body;
  let resModel = await User.login(email, password);
  if (resModel.errno) {
    throw new MyErr(ErrRes.USER.UPDATE.ORIGIN_PASSWORD_ERR);
  }
  ctx.body = resModel;
});
//  cancel follow
router.post("/cancelFollow", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { id: idol_id } = ctx.request.body;
  const { id: fans_id } = ctx.session.user;
  ctx.body = await User.cancelFollow({ fans_id, idol_id });
});
//  follow
router.post("/follow", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { id: idol_id } = ctx.request.body;
  const { id: fans_id } = ctx.session.user;
  ctx.body = await User.follow({ fans_id, idol_id });
});
//  check email has been registered
router.post("/isEmailExist", VALIDATE.USER, async (ctx, next) => {
  const { email } = ctx.request.body;
  ctx.body = await User.isEmailExist(email);
});
//  register
router.post("/register", VALIDATE.USER, async (ctx, next) => {
  const { email, password } = ctx.request.body;
  ctx.body = await User.register(email, password);
});
//  login
router.post("/", SESSION.set, VALIDATE.USER, async (ctx, next) => {
  const { email, password } = ctx.request.body;
  ctx.body = await User.login(email, password);
});
//  logout
router.get("/logout", CHECK.login, SESSION.remove);
module.exports = router;
