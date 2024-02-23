/**
 * @description Router/Views Square
 */
const router = require("koa-router")();
const Blog = require("../../controller/blog");

//  square page
router.get("/square", async (ctx) => {
  let author_id = ctx.session.user?.id;
  let {
    data: { blogs },
  } = await Blog.findListOfSquare(author_id);
  await ctx.render("square", {
    title: "廣場頁",
    blogs,
  });
});

module.exports = router;
