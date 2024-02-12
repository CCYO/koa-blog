const {
  VIEWS: { CHECK },
} = require("../../middleware");
const {
  DEFAULT: { ALBUM_LIST },
} = require("../../config");
const Blog = require("../../controller/blog"); //  0411
let router = require("koa-router")(); //  0411
router.prefix("/album"); //  0411
//  0411
router.get("/list", CHECK.login, async (ctx, next) => {
  let author = ctx.session.user;
  let author_id = author.id;
  let { data: album } = await Blog.findListForAlbumListPage(author_id);
  await ctx.render("albumList", {
    title: "文章照片列表",
    author,
    album,
    pagination: ALBUM_LIST.PAGINATION,
  });
});
//  0411
router.get("/:blog_id", CHECK.login, async (ctx, next) => {
  let blog_id = ctx.params.blog_id * 1;
  let author_id = ctx.session.user.id;
  let {
    data: { imgs, ...blog },
  } = await Blog.findAlbum({ blog_id, author_id });
  await ctx.render("album", {
    blog,
    imgs,
  });
});
module.exports = router;
