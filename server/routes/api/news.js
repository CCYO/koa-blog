/**
 * @description API news相關
 */
const router = require("koa-router")();
const News = require("../../controller/news");
const { CHECK, SESSION } = require("../../middleware/api");
router.prefix("/api/news");
//  鑒察
router.post("/", CHECK.login, SESSION.news, async (ctx, next) => {
  //  let { page, newsList, excepts } = ctx.request.body
  //  ler { } = ctx.request.body
  let { excepts } = ctx.request.body;
  let user_id = ctx.session.user.id;
  let options = { user_id, excepts };
  ctx.body = await News.readMore(options);
  //  ctx.body 經過 SESSION.news 會再調整
});
module.exports = router;
