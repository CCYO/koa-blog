const Redir = require("../../utils/redir");
const S_Cache = require("../../server/cache");
const { log } = require("../../utils/log");
const {
  DEFAULT: {
    CACHE: { STATUS },
  },
  ENV,
} = require("../../config");

async function noCache(ctx, next) {
  await next();
  //  不允許前端緩存
  _noStore(ctx);
}

//  生成middleware，可取得後端系統緩存，且允許前端緩存
let genCommon = (type) => {
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
let genPrivate = (type) => {
  let TYPE = type;

  return async function (ctx, next) {
    if (!ctx.session.user) {
      Redir.login(ctx.href);
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
  function _noCache() {
    return async (ctx, next) => {
      ctx.cache = { exist: STATUS.NO_CACHE };
      await next();
      //  不允許前端緩存
      _noStore(ctx);
    };
  }
  genCommon = _noCache;
  genPrivate = _noCache;
}

module.exports = {
  noCache,
  genCommon,
  genPrivate,
};

//  不允許前端緩存
function _noStore(ctx) {
  ctx.set({
    ["Cache-Control"]: "no-store",
  });
  log(`不允許前端緩存 ${ctx.request.path} 響應的數據`);
}
