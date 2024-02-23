/**
 * @description Router/Views blog
 */

const router = require("koa-router")();
const {
  VIEWS: { CHECK, NEWS },
  GEN_CACHE_FN,
} = require("../../middleware");
const Blog = require("../../controller/blog");
const {
  DEFAULT: {
    CACHE: { TYPE },
  },
} = require("../../config");
const ejs_template = require("../../utils/ejs_template");
const privateCache = GEN_CACHE_FN.private(TYPE.PAGE.BLOG);
const commonCache = GEN_CACHE_FN.common(TYPE.PAGE.BLOG);

//  preview blog page
router.get("/blog/preview/:id", CHECK.login, privateCache, async (ctx) => {
  let opts = {
    //  來自 privateCache
    cache: ctx.cache,
    author_id: ctx.session.user.id,
    blog_id: ctx.params.id * 1,
  };
  let { errno, data } = await Blog.findInfoForPrivatePage(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    //  將 data 賦予 ctx.cache，稍後 privateCache 會視情況處理緩存
    ctx.cache.data = data;
    await ctx.render("blog", {
      ejs_template,
      blog: { ...data, showComment: false },
      me_id: ctx.session.user?.id || 0,
    });
  }
});
//  blog editor pge
router.get("/blog/edit/:id", CHECK.login, privateCache, async (ctx, next) => {
  let opts = {
    //  來自 privateCache
    cache: ctx.cache,
    author_id: ctx.session.user.id,
    blog_id: ctx.params.id * 1,
  };
  let { errno, data } = await Blog.findInfoForPrivatePage(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    //  將 data 賦予 ctx.cache，稍後 privateCache 會視情況處理緩存
    ctx.cache.data = data;
    await ctx.render("blog-edit", {
      blog: { ...data, showComment: false },
    });
  }
});
//  blog page
router.get("/blog/:id", NEWS.confirm, commonCache, async (ctx) => {
  let opts = {
    //  來自 privateCache
    cache: ctx.cache,
    blog_id: ctx.params.id * 1,
    user_id: ctx.session.user?.id,
  };
  let { errno, data } = await Blog.findInfoForCommonPage(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    //  將 data 賦予 ctx.cache，稍後 privateCache 會視情況處理緩存
    ctx.cache.data = data;
    await ctx.render("blog", {
      ejs_template,
      blog: { ...data, showComment: true },
      me_id: ctx.session.user?.id || 0,
    });
  }
});

module.exports = router;
