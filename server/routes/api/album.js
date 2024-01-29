const BlogImgAlt = require("../../controller/blogImgAlt");
const Blog = require("../../controller/blog");
const {
  API: { CHECK, CACHE },
} = require("../../middleware"); //  0411
const { ErrRes, MyErr } = require("../../model");
const router = require("koa-router")(); //  0411
router.prefix("/api/album"); //  0411
//  0411
router.patch("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { blog_id, alt, alt_id } = ctx.request.body;
  /* 驗證是否本人 */
  // const { data: { author: { id: author_id }} } = await Blog.find(blog_id)
  // if(author_id !== ctx.session.user.id){
  //     throw new MyErr(ErrRes.PERMISSION.NOT_OWNER)
  // }
  /* 更新照片數據 */
  let { id: author_id } = ctx.session.user;
  ctx.body = await BlogImgAlt.modify({ author_id, alt_id, blog_id, alt });
});
module.exports = router;
