const {
  VIEWS: { CHECK },
} = require("../../middleware");
const User = require("../../controller/user");
const Blog = require("../../controller/blog"); //  0411
let router = require("koa-router")(); //  0411
router.prefix("/album"); //  0411
//  0411
router.get("/list", CHECK.login, CHECK.mustBeOwner, async (ctx, next) => {
  let author_id = ctx.request.query.owner_id * 1;
  let pagination = ctx.query;
  let resModel = await User.findAlbumListOfUser(author_id, pagination);
  if (resModel.errno) {
    await ctx.render("page404", resModel);
    return;
  }
  let {
    data: { author, albums },
  } = resModel;
  await ctx.render("albumList", {
    title: "文章照片列表",
    author,
    albums,
  });
});
//  0411
router.get("/:blog_id", CHECK.login, CHECK.mustBeOwner, async (ctx, next) => {
  let blog_id = ctx.params.blog_id * 1;
  let res = await Blog.findWholeInfo(blog_id);
  let { errno, data } = res;
  if (errno) {
    await ctx.render("page404", res);
  }
  let { id, title, imgs } = data;
  await ctx.render("album", {
    title,
    album: {
      blog: { id, title },
      imgs,
    },
  });
});
module.exports = router;
