/**
 * @description API editor 相關
 */
const router = require("koa-router")();
const {
  API: { CACHE, CHECK, FIREBASE, VALIDATE },
} = require("../../middleware");
const Blog = require("../../controller/blog");

router.prefix("/api/blog");

//  get data for userPage then turn pagination of blogList
router.post("/list", async (ctx) => {
  let opts = {
    currentUser: ctx.session.user,
    ...ctx.request.body,
  };
  ctx.body = await Blog.findListForPagination(opts);
});

//  confirm articleReader
router.get(
  "/confirm/:articleReader_id",
  CHECK.login,
  CACHE.modify,
  async (ctx) => {
    let opts = {
      reader_id: ctx.session.user.id,
      articleReader_id: ctx.params.articleReader_id * 1,
    };
    ctx.body = await Blog.confirmNews(opts);
  }
);
//  delete blogs
router.delete("/", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    author_id: ctx.session.user.id,
    blogList: ctx.request.body.blogList,
  };
  ctx.body = await Blog.removeList(opts);
});
//  add blog
router.post("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { title } = ctx.request.body;
  ctx.body = await Blog.add(title, ctx.session.user.id);
});
//  update blog img
router.post(
  "/img",
  CHECK.login,
  CACHE.modify,
  FIREBASE.blogImg,
  async (ctx) => {
    let opts = {
      author_id: ctx.session.user.id,
      ...ctx.request.body,
    };
    ctx.body = await Blog.addImg(opts);
  }
);
//  update blog
router.patch("/", CHECK.login, CACHE.modify, VALIDATE.BLOG, async (ctx) => {
  let opts = {
    author_id: ctx.session.user.id,
    ...ctx.request.body,
  };
  ctx.body = await Blog.modify(opts);
});

module.exports = router;
