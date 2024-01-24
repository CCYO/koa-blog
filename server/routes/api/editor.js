const { CACHE, CHECK, FIREBASE, VALIDATE } = require("../../middleware/api");
/**
 * @description API editor 相關
 */
const {
  DEFAULT: { BLOG },
} = require("../../config");
const BlogImgAlt = require("../../controller/blogImgAlt"); //  0409

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

//  0411
//  刪除 blogs
router.delete(
  "/",
  CHECK.login,
  CHECK.mustBeOwner,
  CACHE.modify,
  async (ctx, next) => {
    // const author_id = ctx.session.user.id
    const { blogList } = ctx.request.body;
    ctx.body = await Blog.removeList(blogList);
  }
);

//  -------------------------------------------------------------------------
const Blog = require("../../controller/blog");

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
    await Blog.addImg(ctx.request.body);
  }
);
//  為Blog既存圖片建立alt數據
router.post("/blogImgAlt", CHECK.login, CACHE.modify, async (ctx, next) => {
  let { blogImg_id } = ctx.request.body;
  ctx.body = await BlogImgAlt.add(blogImg_id);
});
//  初始化blog的圖片列表數據（通常用在上一次Blog有上傳圖片，但未儲存文章時，會導致沒有建立edito需要的<x-img>，因此需要初始化將其刪除）
router.patch("/initImgs", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { id: author_id } = ctx.session.user;
  const { id: blog_id, cancelImgs } = ctx.request.body;
  //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
  // let res = await BlogImgAlt.cutImgsWithBlog(blog_id, cancelImgs, user_id);
  let res = await Blog.removeImgList({ author_id, blog_id, cancelImgs });
  ctx.body = res;
});

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
