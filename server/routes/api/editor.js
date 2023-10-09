/**
 * @description API editor 相關
 */
const CONS = require("../../../config/const");
const BlogImgAlt = require("../../controller/blogImgAlt"); //  0409
const Blog = require("../../controller/blog"); //  0406
const { CACHE, CHECK, FIREBASE } = require("../../middleware/api"); //  0406
const router = require("koa-router")(); //  0406
router.prefix("/api/blog");

router.post("/list", CHECK.login, async (ctx, next) => {
  let { id } = ctx.session.user;
  let { STATUS, PAGINATION } = CONS.DATAS.BLOG;
  let {
    author_id,
    show: status = STATUS.PUBLIC,
    limit = PAGINATION.BLOG_COUNT,
    offset = 0,
  } = ctx.request.body;
  if (author_id !== id) {
  }
  let resModel;
  if (status === STATUS.PUBLIC) {
    resModel = await Blog.findPublicListForUserPage(author_id, {
      limit,
      offset,
    });
  } else if (status === STATUS.PRIVATE) {
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
//  0409
//  為Blog既存圖片建立alt數據
router.post("/blogImgAlt", CHECK.login, CACHE.modify, async (ctx, next) => {
  let { blogImg_id } = ctx.request.body;
  ctx.body = await BlogImgAlt.add({ blogImg_id });
});
//  更新 blog 資料  0326
router.patch(
  "/",
  CHECK.login,
  CHECK.mustBeOwner,
  CACHE.modify,
  async (ctx, next) => {
    const { owner_id, blog_id, ...blog_data } = ctx.request.body;
    res = await Blog.modify(blog_id, blog_data);
    ctx.body = res;
  }
);
//  0406
//  上傳圖片
router.post("/img", CHECK.login, CACHE.modify, FIREBASE.blogImg);
//  0406
//  建立blog
router.post("/", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { title } = ctx.request.body;
  return (ctx.body = await Blog.add(title, ctx.session.user.id));
});
module.exports = router;

//  與圖片有關 -------

//  初始化blog的圖片列表數據（通常用在上一次Blog有上傳圖片，但未儲存文章時，會導致沒有建立edito需要的<x-img>，因此需要初始化將其刪除）
router.patch("/initImgs", CHECK.login, CACHE.modify, async (ctx, next) => {
  const { id: user_id } = ctx.session.user;
  const { id: blog_id, cancelImgs } = ctx.request.body;
  //  cancelImgs [{blogImg_id, blogImgAlt_list}, ...]
  let res = await BlogImgAlt.cutImgsWithBlog(blog_id, cancelImgs, user_id);
  ctx.body = res;
});
