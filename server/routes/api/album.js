const BlogImgAlt = require("../../controller/blogImgAlt");
const {
  API: { CHECK, CACHE },
} = require("../../middleware");
const router = require("koa-router")();
router.prefix("/api/album");
router.patch("/", CHECK.login, CACHE.modify, async (ctx) => {
  const { blog_id, alt, alt_id } = ctx.request.body;
  let { id: author_id } = ctx.session.user;
  ctx.body = await BlogImgAlt.modify({ author_id, alt_id, blog_id, alt });
});
module.exports = router;
