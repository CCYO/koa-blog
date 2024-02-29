/**
 * 系統直接調用的緩存處理
 */

const S_Cache = require("../../server/cache");
const { log } = require("../../utils/log");
const {
  DEFAULT: {
    CACHE: { STATUS },
  },
  ENV,
} = require("../../config");

//  若是當前使用者，跳往個人頁
async function isSelf(ctx, next) {
  let me = ctx.session.user ? ctx.session.user.id : undefined;
  let currentUser = ctx.params.id * 1;
  //  若是自己的ID，跳轉到個人頁面
  if (me === currentUser) {
    return ctx.redirect("/self");
  }
  await next();
}

/** 驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else {
    _redirLogin(ctx);
  }
  return;
}
//  登入狀態鑿直接跳往個人頁，且不允許前端緩存
async function skipLogin(ctx, next) {
  if (ctx.session.user) {
    //  若已登入，跳轉到個人頁面
    ctx.redirect("/self");
    return;
  }
  await next();
  //  避免登入狀態時點擊上一頁，到達未登入狀態才允許看得到的頁面，故不允許緩存
  _noStore(ctx);
}
//  不允許前端緩存
function _noCache(type) {
  return async function (ctx, next) {
    ctx.cache = { exist: STATUS.NO_CACHE };
    await next();
    //  不允許前端緩存
    _noStore(ctx);
  };
}
//  生成middleware，可取得後端系統緩存，且允許前端緩存
let common = (type) => {
  let TYPE = type;
  return async function (ctx, next) {
    let id = ctx.params.id * 1;
    let ifNoneMatch = ctx.headers["if-none-match"];
    //  向系統cache撈資料 { exist: 提取緩存數據的結果 , data: initBlog || undefined }
    let cache = S_Cache.getTYPE(TYPE);
    //  將數據綁在 ctx.cache
    ctx.cache = await cache.get(id, ifNoneMatch);
    if (ctx.cache.exist === STATUS.HAS_FRESH_CACHE) {
      ctx.status = 304;
      return;
    }
    await next();

    //  判斷是否將數據存入系統緩存
    let { exist, data, etag } = ctx.cache;
    //  當前系統緩存，無資料 || eTag已過期
    if (exist === STATUS.NO_CACHE) {
      //  將blog存入系統緩存
      etag = await cache.set(id, data);
    }
    //  將etag傳給前端做緩存
    ctx.set({
      etag,
      ["Cache-Control"]: "no-cache",
    });
    log(`${TYPE}/${id} 提供前端 etag 做緩存`);
    delete ctx.cache;
  };
};
//  生成middleware，可取得後端系統緩存，且不允許前端緩存
let private = (type) => {
  let TYPE = type;

  return async function (ctx, next) {
    if (!ctx.session.user) {
      _redirLogin(ctx);
      return;
    }

    let id = ctx.params.id * 1;
    if (ctx.request.path === "/self") {
      id = ctx.session.user.id;
    }

    //  edit頁面的緩存數據格式
    /**
     * {
     * exist: 提取緩存數據的結果 ,
     * data: { currentUser, fansList, idolList, blogList } || undefined
     * }
     */
    let cache = S_Cache.getTYPE(TYPE);
    ctx.cache = await cache.get(id);
    await next();
    let { exist, data } = ctx.cache;
    //  系統沒有應對的緩存資料
    if (exist === STATUS.NO_CACHE && data) {
      //  將數據存入系統緩存
      await cache.set(id, data);
    }
    //  不允許前端緩存
    _noStore(ctx);
    delete ctx.cache;
  };
};

if (ENV.isNoCache) {
  common = _noCache;
  private = _noCache;
}

module.exports = {
  common,
  private,
  skipLogin,
  //  0501
  isSelf,
  //  0501
  login,
};
//  redirect login page
function _redirLogin(ctx) {
  let url = new URL(ctx.href);
  let search = url.search;
  let from = encodeURIComponent(url.pathname + search);
  ctx.redirect(`/login?from=${from}`);
}
//  不允許前端緩存
function _noStore(ctx) {
  ctx.set({
    ["Cache-Control"]: "no-store",
  });
  log(`不允許前端緩存 ${ctx.request.path} 響應的數據`);
}
