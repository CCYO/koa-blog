const router = require("koa-router")();
const {
  API: { CHECK, CACHE, VALIDATE },
} = require("../../middleware");
const BlogImgAlt = require("../../controller/blogImgAlt");
router.prefix("/api/album");

// update alt of blog's img
router.patch("/", CHECK.login, CACHE.modify, VALIDATE.ALT, async (ctx) => {
  let opts = {
    author_id: ctx.session.user.id,
    ...ctx.request.body,
  };
  ctx.body = await BlogImgAlt.modify(opts);
});

module.exports = router;
