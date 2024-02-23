/**
 * 系統直接調用的緩存處理
 */

const S_Cache = require("../server/cache");
const {
  DEFAULT: {
    CACHE: { STATUS },
  },
  ENV,
} = require("../config");

function _noCache(type) {
  return async function (ctx, next) {
    ctx.cache = { exist: STATUS.NO_CACHE };
    await next();
    //  不允許前端緩存
    ctx.set({
      ["Cache-Control"]: "no-store",
    });
    console.log(`@noCache模式，不替 ${ctx.request.path} 處理緩存`);
    delete ctx.cache;
  };
}

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
    console.log(`${TYPE}/${id} 提供前端 etag 做緩存`);
    delete ctx.cache;
  };
};

let private = (type) => {
  let TYPE = type;

  return async function (ctx, next) {
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
    // ctx.cache = {
    //   [TYPE]: await cache.get(id),
    // };
    ctx.cache = await cache.get(id);
    await next();
    // let { exist, data } = ctx.cache[TYPE];
    let { exist, data } = ctx.cache;
    //  系統沒有應對的緩存資料
    if (exist === STATUS.NO_CACHE && data) {
      //  將blog存入系統緩存
      await cache.set(id, data);
    }
    //  不允許前端緩存
    ctx.set({
      ["Cache-Control"]: "no-store",
    });
    console.log(`不允許前端緩存 ${ctx.request.path} 響應的數據`);
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
};
