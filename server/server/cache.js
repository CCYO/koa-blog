const { getCache } = require("../db/redis");
const { log } = require("../utils/log");
//  0503
const {
  ENV,
  DEFAULT: {
    CACHE: {
      //  0503
      STATUS,
      TYPE: { NEWS },
    },
  },
} = require("../config");

//  更新系統緩存
async function modify(resModelCache) {
  for (let [type, list] of Object.entries(resModelCache)) {
    if (!list.length) {
      continue;
    }
    let cache = getTYPE(type);
    if (type === NEWS) {
      //  提醒使用者的通知數據有變動，要重新從DB讀取
      await cache.add(list);
    } else if (ENV.isNoCache) {
      continue;
    } else {
      //  移除既存的頁面緩存數據，要重新從DB讀取
      await cache.del(list);
    }
  }
  return true;
}

//  生成obj，具有可以針對指定類型的系統緩存，進行存取的方法
function getTYPE(type) {
  let cache = getCache(type);
  if (type === NEWS) {
    return cache;
  }
  return {
    //  取得緩存資訊
    async get(id, ifNoneMatch) {
      let res = { exist: STATUS.NO_CACHE, data: undefined, etag: undefined };
      if (ENV.isNoCache) {
        return res;
      }
      if (!(await cache.has(id))) {
        log(`請求取得 cache ${type}/${id}時，發現無緩存`);
        //  沒有緩存
        return res;
      }
      let kv = await cache.get(id);
      let [etag, data] = Object.entries(kv)[0];
      res = { etag, data };
      if (!ifNoneMatch) {
        //  沒有 if-none-match
        res.exist = STATUS.NO_IF_NONE_MATCH;
        log(`請求取得 cache ${type}/${id} 時，沒有提供 if-none-match`);
      } else if (etag !== ifNoneMatch) {
        //  if-none-match 不匹配
        res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH;
        log(`請求取得 cache ${type}/${id} 時，if-none-match 已過期`);
      } else {
        //  if-none-match 有效
        res.exist = STATUS.HAS_FRESH_CACHE;
        log(`請求取得 cache ${type}/${id} 時，直接使用有效緩存`);
      }
      return res;
    },
    //  設置緩存，並返回緩存數據所生成的etag
    async set(id, data) {
      if (ENV.isNoCache) {
        return false;
      }
      //  RV: etag
      return await cache.set(id, data);
    },
    //  清除緩存
    async del(id_list) {
      if (ENV.isNoCache) {
        return false;
      }
      return await cache.del(id_list);
    },
  };
}
module.exports = {
  //  0504
  getTYPE,
  //  0503
  modify,
};
