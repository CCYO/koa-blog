/**
 * @description API news相關
 */
const router = require("koa-router")();
const {
  API: { CHECK, SESSION },
} = require("../../middleware");
const News = require("../../controller/news");
router.prefix("/api/news");
//  get news data
router.post("/", CHECK.login, SESSION.news, async (ctx, next) => {
  let { excepts } = ctx.request.body;
  let user_id = ctx.session.user.id;
  let options = { user_id, excepts };
  ctx.body = await News.readMore(options);
});
module.exports = router;
