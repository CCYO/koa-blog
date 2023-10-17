/**
 * @description Router/Views blog
 */

const template_fn = require("../../utils/template_fn");
const CONFIG_CONST = require("../../../config/const");
//  0501
const {
  CACHE: { TYPE, STATUS },
} = require("../../conf/constant");
//  0501
const {
  VIEWS: { CHECK, NEWS },
  GEN_CACHE_FN,
} = require("../../middleware");
//  0406
const Blog = require("../../controller/blog");
//  0406
const router = require("koa-router")();
//  0504
const privateCache = GEN_CACHE_FN.private(TYPE.PAGE.BLOG);
//  0504
const commonCache = GEN_CACHE_FN.common(TYPE.PAGE.BLOG);
//  0406
//  編輯文章
router.get(
  "/blog/edit/:id",
  CHECK.login,
  CHECK.mustBeOwner,
  privateCache,
  async (ctx, next) => {
    const blog_id = ctx.params.id * 1;
    //  從 middleware 取得的緩存數據 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
    let cacheStatus = ctx.cache[TYPE.PAGE.BLOG];
    let { exist } = cacheStatus;
    let cacheKey = `${TYPE.PAGE.BLOG}/${blog_id}`;
    //  系統沒有緩存數據
    if (exist === STATUS.NO_CACHE) {
      //  向 DB 撈取數據
      const resModel = await Blog.findWholeInfo(blog_id);
      //  DB 沒有相符數據
      if (resModel.errno) {
        console.log(`@ DB 不存在 blog/${blog_id} 數據 `);
        return await ctx.render("page404", {
          ...resModel,
          title: "文章不存在",
        });
        //  將html數據做百分比編碼，交由前端解碼
      } else {
        console.log(`@ 從 DB 取得 ${cacheKey}`);
        //  將 DB 數據賦予給 ctx.cache
        cacheStatus.data = resModel.data;
        cacheStatus.data.html =
          cacheStatus.data.html && encodeURI(cacheStatus.data.html);
        //  若html有值，則進行解碼
      }
    } else {
      console.log(`@ ${cacheKey} -> 使用系統緩存`);
    }
    return await ctx.render("blog-edit", {
      blog: { ...cacheStatus.data, showComment: false },
    });
  }
);
//  0406
//  查看文章
router.get("/blog/:id", NEWS.confirm, commonCache, async (ctx, next) => {
  const blog_id = ctx.params.id * 1;
  //  從 middleware 取得的緩存數據 ctx.cache[PAGE.BLOG]
  /**
   * {
   ** exist: 提取緩存數據的結果 ,
   ** data: blogIns || undefined
   * }
   */
  let cache = ctx.cache[TYPE.PAGE.BLOG];
  let { exist } = cache;
  let cacheKey = `${TYPE.PAGE.BLOG}/${blog_id}`;
  if (exist === STATUS.HAS_FRESH_CACHE) {
    console.log(`@ ${cacheKey} 響應 304`);
    ctx.status = 304;
  } else if (
    exist === STATUS.NO_IF_NONE_MATCH ||
    exist == STATUS.IF_NONE_MATCH_IS_NO_FRESH
  ) {
    console.log(`@ ${cacheKey} 響應 系統緩存數據`);
  } else {
    //  向 DB 提取數據
    let resModel = await Blog.findWholeInfo(blog_id);
    //  DB 沒有相符數據
    if (resModel.errno) {
      return await ctx.render("page404", resModel);
      //  將html數據做百分比編碼，交由前端解碼
    }
    console.log(`@ 從 DB 取得 ${cacheKey}`);
    //  將 DB 數據賦予給 ctx.cache
    cache.data = resModel.data;
    cache.data.html = encodeURI(cache.data.html);
  }
  let url = new URL(ctx.href);
  let params = url.searchParams;

  let showComment =
    !params.get(CONFIG_CONST.DATAS.BLOG.SEARCH_PARAMS.PREVIEW) &&
    cache.data.show;
  let comments = [
    {
      id: 111,
      html: "<p>222</p>",
      time: "111time111",
      isDeleted: false,
      commenter: { id: 1, nickname: "user1" },
      reply: [],
    },
    {
      id: 222,
      html: "<p>222</p>",
      time: "222time222",
      isDeleted: false,
      commenter: { id: 2, nickname: "user2" },
      reply: [
        {
          id: 333,
          html: `<p>333</p>`,
          time: "333time333",
          isDeleted: false,
          commenter: { id: 3, nickname: "user3" },
          reply: [],
        },
        {
          id: 444,
          html: "<p>444</p>",
          time: "444time444",
          isDeleted: true,
          commenter: { id: 4, nickname: "user4" },
          reply: [],
        },
      ],
    },
  ];
  let isLogin = ctx.session.user ? true : false;
  let me_id = isLogin ? ctx.session.user.id : 0;
  return await ctx.render("blog", {
    blog: { ...cache.data, showComment, comments },
    temFn_comment_list: template_fn.comment_list,
    temFn_comment_item: template_fn.comment_item,
    isLogin,
    me_id,
  });
});

router.get("/bbb/:id", async (ctx, next) => {
  let comments = [
    {
      id: 111,
      html: "<p>111</p>",
      time: "111time111",
      isDeleted: false,
      reply: [],
    },
    {
      id: 222,
      html: "<p>222</p>",
      time: "222time222",
      isDeleted: false,
      reply: [
        {
          id: 333,
          html: "<p>333</p>",
          time: "333time333",
          isDeleted: false,
          reply: [],
        },
        {
          id: 444,
          html: "<p>444</p>",
          time: "444time444",
          isDeleted: true,
          reply: [],
        },
      ],
    },
  ];
  let blog = {
    id: 666,
    title: "標題",
    showComment: true,
  };
  return await ctx.render("blog", {
    blog: { ...cache.data, showComment, comments },
  });
});
module.exports = router;
