//  0430
const { getCache } = require("../db/redis");
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

//  0228
async function modify(resModelCache) {
  for (let [type, list] of Object.entries(resModelCache)) {
    if (!list.length) {
      continue;
    }
    let cache = getTYPE(type);
    if (type === NEWS) {
      //  提醒使用者的通知數據有變動，要重新從DB讀取
      // let cache = await getNews();
      // await cache.addList(list);
      await cache.add(list);
    } else if (ENV.isNoCache) {
      continue;
    } else {
      //  移除既存的頁面緩存數據，要重新從DB讀取
      // let cache = await getTYPE(type);
      // await cache.delList(list);
      await cache.del(list);
    }
  }
  return true;
}

//  0504
function getTYPE(type) {
  //  Map { blog_id => { etag: SuccModel }, ... }
  // let cacheType = await Redis.getMap(type);
  // let cacheType = Cache[type];
  let cache = getCache(type);
  if (type === NEWS) {
    return cache;
  }
  return {
    //  0501
    //  取得 blog 緩存
    async get(id, ifNoneMatch) {
      let res = { exist: STATUS.NO_CACHE, data: undefined, etag: undefined };
      if (ENV.isNoCache) {
        return res;
      }

      //  { etag: data }
      // let cache = await cacheType.get(id);
      // if (!cache) {
      if (!(await cache.has(id))) {
        //  沒有緩存
        return res;
      }
      //  使用 if-none-match 取出緩存數據
      // let data = cache[ifNoneMatch];
      let kv = await cache.get(id);
      let [etag, data] = Object.entries(kv);
      res = { etag, data };
      if (!ifNoneMatch) {
        //  沒有 if-none-match
        res.exist = STATUS.NO_IF_NONE_MATCH;
        // } else if (!data) {
      } else if (etag !== ifNoneMatch) {
        //  if-none-match 不匹配
        res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH;
      } else {
        //  if-none-match 有效
        // return { exist: STATUS.HAS_FRESH_CACHE, data, etag: ifNoneMatch };
        res.exist = STATUS.HAS_FRESH_CACHE;
      }
      //  分解緩存，取出 etag 與 緩存數據
      // res.etag = Object.keys(cache)[0];
      // res.data = Object.values(cache)[0];
      return res;
    },
    //  0501
    //  設置 user 緩存
    async set(id, data) {
      if (ENV.isNoCache) {
        return false;
      }
      let etag = await cache.set(id, data);
      return etag;
    },
    //  0501
    //  清除緩存
    async del(list) {
      if (ENV.isNoCache) {
        return false;
      }
      console.log("@要刪除的 list => ", list);
      return await cache.del(list);
    },
  };
}
module.exports = {
  //  0504
  // getNews,
  //  0504
  getTYPE,
  //  0503
  modify,
  removeRemindNews,
};

async function removeRemindNews(id) {
  let r = await Redis.get("cacheNews");
  let news = new Set(r);
  let listOfUserId = id;
  if (!Array.isArray(listOfUserId)) {
    listOfUserId = [listOfUserId];
  }

  listOfUserId.forEach((item) => {
    news.delete(item);
    console.log(`@ 從系統緩存 cacheNews 移除 ${item} `);
  });

  await Redis.set("cacheNews", [...news]);

  return news;
}
