const { ENV } = require("../../config");
const { ErrModel, ErrRes } = require("../../model");

const router = require("koa-router")();

router.get("/permission/:errno", async (ctx) => {
  let opts = {};
  switch (ctx.params.errno * 1) {
    case ErrRes.PAGE.NO_LOGIN.errno:
      opts.title = "提醒頁";
      opts.errModel = new ErrModel(ErrRes.PAGE.NO_LOGIN);
      opts.from = ctx.query.from;
      break;
    case ErrRes.PAGE.NO_PAGE.errno:
      opts.errModel = new ErrModel(ErrRes.PAGE.NO_PAGE);
      opts.title = "404";
      break;
    case ErrRes.BLOG.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ErrRes.BLOG.READ.NOT_EXIST);
      opts.title = ErrRes.BLOG.READ.NOT_EXIST.msg;
      break;
    case ErrRes.COMMENT.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ErrRes.BLOG.READ.NOT_EXIST);
      opts.title = ErrRes.COMMENT.READ.NOT_EXIST.msg;
      break;
    case ErrRes.BLOG.READ.NO_ALBUM.errno:
      opts.errModel = new ErrModel(ErrRes.BLOG.READ.NOT_EXIST);
      opts.title = ErrRes.COMMENT.READ.NOT_EXIST.msg;
  }
  await ctx.render("page404", opts);
});

router.get("/serverError", async (ctx) => {
  let opts = {
    title: "serverError",
    errModel: new ErrModel(ErrRes.SERVER.ERR_500),
  };
  ctx.request.query.hasOwnProperty;
  ctx.query.hasOwnProperty;
  if (!ENV.isProd && ctx.query.serverError) {
    let { serverError } = ctx.query;
    serverError = JSON.parse(decodeURIComponent(serverError));
    opts.serverError = serverError;
  }
  await ctx.render("page404", opts);
});

module.exports = router;
