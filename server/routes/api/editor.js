const { CACHE, CHECK, FIREBASE, VALIDATE } = require("../../middleware/api");
/**
 * @description API editor 相關
 */
const {
  DEFAULT: { BLOG },
} = require("../../config");

const router = require("koa-router")(); //  0406
router.prefix("/api/blog");

router.post("/list", CHECK.login, async (ctx, next) => {
  let { id } = ctx.session.user;
  let {
    author_id,
    show,
    limit = BLOG.PAGINATION.BLOG_COUNT,
    offset = 0,
  } = ctx.request.body;
  if (author_id !== id) {
    //  如果不是本人，又想讀取隱藏文章，抱錯
  }
  let resModel;
  if (show) {
    resModel = await Blog.findPublicListForUserPage(author_id, {
      limit,
      offset,
    });
  } else {
    resModel = await Blog.findPrivateListForUserPage(author_id, {
      limit,
      offset,
    });
  }
  ctx.body = resModel;
});

//  -------------------------------------------------------------------------
const Blog = require("../../controller/blog");
//  刪除 blogs
router.delete("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  const author_id = ctx.session.user.id;
  const { blogList } = ctx.request.body;
  ctx.body = await Blog.removeList({ blogList, author_id });
});
//  建立blog
router.post("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { title } = ctx.request.body;
  ctx.body = await Blog.add(title, ctx.session.user.id);
});
//  上傳圖片
router.post(
  "/img",
  CHECK.login,
  CACHE.modify,
  FIREBASE.blogImg,
  async (ctx, next) => {
    let author_id = ctx.session.user.id;
    ctx.body = await Blog.addImg({ author_id, ...ctx.request.body });
  }
);
//  更新 blog 資料
router.patch(
  "/",
  CHECK.login,
  CACHE.modify,
  VALIDATE.BLOG,
  async (ctx, next) => {
    let author_id = ctx.session.user.id;
    let resModel = await Blog.modify({ author_id, ...ctx.request.body });
    ctx.body = resModel;
  }
);
module.exports = router;
