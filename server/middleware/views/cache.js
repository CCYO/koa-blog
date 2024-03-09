const Redir = require("../../utils/redir");
const C_CachePage = require("../../controller/cache_page");
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
let genCommon = (type) =>
  async function (ctx, next) {
    let id = ctx.params.id * 1;
    let ifNoneMatch = ctx.headers["if-none-match"];
    let cacheStatus = { data: undefined, etag: undefined };
    //  cacheStatus { exist: 提取緩存數據的結果 , data, etag }
    let resModel = await C_CachePage.find(type, id);
    if (resModel.errno) {
      cacheStatus.exist = STATUS.NO_CACHE;
      log(`請求取得 cache ${type}/${id} 時，無緩存紀錄`);
    } else if (!ifNoneMatch) {
      //  沒有 if-none-match
      cacheStatus = {
        ...resModel.data,
        exist: STATUS.NO_IF_NONE_MATCH,
      };
      log(`請求取得 cache ${type}/${id} 時，沒有提供 if-none-match`);
    } else if (ifNoneMatch !== resModel.data.etag) {
      //  if-none-match 不匹配
      cacheStatus = {
        ...resModel.data,
        exist: STATUS.IF_NONE_MATCH_IS_NO_FRESH,
      };
      log(`請求取得 cache ${type}/${id} 時，if-none-match 已過期`);
    } else {
      //  if-none-match 有效
      log(`請求取得 cache ${type}/${id} 時，直接使用有效緩存`);
      ctx.status = 304;
      return;
    }
    ctx.cache = cacheStatus;
    await next();

    //  判斷是否將數據存入系統緩存
    let { exist, data, etag } = ctx.cache;
    //  當前系統緩存，無資料 || eTag已過期
    if (exist === STATUS.NO_CACHE) {
      //  將blog存入系統緩存
      await C_CachePage.modify(type, id, data);
    }
    //  將etag傳給前端做緩存
    ctx.set({
      etag,
      ["Cache-Control"]: "no-cache",
    });
    log(`${type}/${id} 提供前端 etag 做緩存`);
    delete ctx.cache;
  };

//  生成middleware，可取得後端系統緩存，且不允許前端緩存
let genPrivate = (type) =>
  async function (ctx, next) {
    if (!ctx.session.user) {
      Redir.login(ctx.href);
      return;
    }
    let id = ctx.params.id * 1;
    if (ctx.request.path === "/self") {
      id = ctx.session.user.id;
    }
    let cacheStatus = {
      data: undefined,
      etag: undefined,
    };
    //  cacheStatus { exist: 提取緩存數據的結果 , data, undefined, etag }
    let resModel = await C_CachePage.find(type, id);
    if (!resModel.errno) {
      cacheStatus = {
        exist: STATUS.NO_IF_NONE_MATCH,
        ...resModel.data,
      };
      log(`請求取得 cache ${type}/${id} 時，有緩存紀錄`);
    } else {
      cacheStatus.exist = STATUS.NO_CACHE;
      log(`請求取得 cache ${type}/${id} 時，無緩存紀錄`);
    }
    ctx.cache = cacheStatus;
    await next();
    let { exist, data } = ctx.cache;
    //  系統沒有應對的緩存資料
    if (exist === STATUS.NO_CACHE && data) {
      //  將數據存入系統緩存
      await C_CachePage.modify(type, id, data);
    }
    //  不允許前端緩存
    _noStore(ctx);
    delete ctx.cache;
  };

function _noCache() {
  return async (ctx, next) => {
    ctx.cache = { exist: STATUS.NO_CACHE };
    log(`請求取得 cache ${type}/${id} 時，因為 ENV NOCACHE 故無緩存紀錄`);
    await next();
    //  不允許前端緩存
    _noStore(ctx);
  };
}

if (ENV.isNoCache) {
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
