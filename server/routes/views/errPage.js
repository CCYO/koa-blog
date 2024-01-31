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
  let errModel;
  if (errno === ErrRes.PAGE.NO_LOGIN.errno) {
    errModel = new ErrModel(ErrRes.PAGE.NO_LOGIN);
    errModel.from = ctx.query.from;
  } else if (errno === ErrRes.PAGE.NO_PAGE.errno) {
    errModel = new ErrModel(ErrRes.PAGE.NO_PAGE);
  }
  await ctx.render("page404", { errModel });
});

module.exports = router;
