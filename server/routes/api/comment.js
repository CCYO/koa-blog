/**
 * @description API commond相關
 */
const router = require("koa-router")();
const {
  API: { CACHE, CHECK },
} = require("../../middleware");
const Comment = require("../../controller/comment");
router.prefix("/api/comment");

//  delete comment
router.delete("/", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    comment_id: ctx.request.body.comment_id,
    user_id: ctx.session.user.id,
  };
  ctx.body = await Comment.remove(opts);
});
//  confirm msgReceiver
router.get(
  "/confirm/:msgReceiver_id",
  CHECK.login,
  CACHE.modify,
  async (ctx) => {
    let opts = {
      receiver_id: ctx.session.user.id,
      msgReceiver_id: ctx.params.msgReceiver_id * 1,
    };
    ctx.body = await Comment.confirmNews(opts);
  }
);
//  add comment
router.post("/", CHECK.login, CACHE.modify, async (ctx) => {
  ctx.body = await Comment.add(ctx.request.body);
});

module.exports = router;
