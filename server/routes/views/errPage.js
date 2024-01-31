const { ErrModel, ErrRes } = require("../../model");

const router = require("koa-router")();

//  0519
// router.get("/errPage", async (ctx, next) => {
//   let { errModel, from } = ctx.request.query;
//   errModel = JSON.parse(decodeURIComponent(errModel));
//   if (from) {
//     errModel.from = from;
//   }
//   await ctx.render("page404", { errModel });
// });

router.get("/permission/:errno", async (ctx) => {
  let errno = ctx.params.errno * 1;
  let opts = {};
  if (errno === ErrRes.PAGE.NO_LOGIN.errno) {
    opts.errModel = new ErrModel(ErrRes.PAGE.NO_LOGIN);
    opts.from = ctx.query.from;
    opts.title = "提醒頁";
  } else if (errno === ErrRes.PAGE.NO_PAGE.errno) {
    opts.errModel = new ErrModel(ErrRes.PAGE.NO_PAGE);
    opts.title = "404";
  }
  await ctx.render("page404", opts);
});

module.exports = router;
