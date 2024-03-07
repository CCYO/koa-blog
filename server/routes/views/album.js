/**
 * @description Router/Views album
 */
let router = require("koa-router")();
const {
  VIEWS: { CHECK, CACHE },
} = require("../../middleware");
const Blog = require("../../controller/blog");
const {
  DEFAULT: { ALBUM_LIST },
} = require("../../config");
router.prefix("/album");

//  album list page
router.get("/list", CACHE.noCache, CHECK.login, async (ctx) => {
  let author = ctx.session.user;
  let { data: album } = await Blog.findListForAlbumListPage(author.id);
  await ctx.render("albumList", {
    title: "文章照片列表",
    author,
    album,
    pagination: ALBUM_LIST.PAGINATION,
  });
});
//  album page of blog_id
router.get("/:blog_id", CACHE.noCache, CHECK.login, async (ctx) => {
  let opts = {
    blog_id: ctx.params.blog_id * 1,
    author_id: ctx.session.user.id,
  };
  let { errno, data } = await Blog.findAlbum(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    let { imgs, ...blog } = data;
    await ctx.render("album", {
      blog,
      imgs,
    });
  }
});

module.exports = router;
