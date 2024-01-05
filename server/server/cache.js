//  0501
const { MyErr, ErrRes } = require("../model");
//  0430
const Redis = require("../db/cache/redis/_redis");
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
async function modify(cache) {
  for (let [type, list] of Object.entries(cache)) {
    if (type === NEWS) {
      //  提醒使用者的通知數據有變動，要重新從DB讀取
      let cache = await getNews();
      await cache.addList(list);
    } else {
      //  移除既存的頁面緩存數據，要重新從DB讀取
      let cache = await getTYPE(type);
      await cache.delList(list);
    }
  }
  return true;
}
//  0504
async function getNews() {
  //  取出緩存資料 redis/cacheNews
  let set = await Redis.getSet(NEWS);
  return {
    get() {
      return set.get();
    },
    has(id) {
      return set.has(id);
    },
    async addList(list) {
      if (list.length) {
        return await set.add(list);
      }
      return false;
    },
    async delList(list) {
      if (list.length) {
        return await set.del(list);
      }
      return false;
    },
  };
}
//  0504
async function getTYPE(type) {
  //  Map { blog_id => { etag: SuccModel }, ... }
  let cacheType = await Redis.getMap(type);
  return {
    //  0501
    //  取得 blog 緩存
    async get(id, ifNoneMatch) {
      let res = { exist: STATUS.NO_CACHE, data: undefined, etag: undefined };
      if (ENV.isNoCache) {
        return res;
      }

      //  { etag: data }
      let cache = await cacheType.get(id);
      if (!cache) {
        //  沒有緩存
        return res;
      }
      //  使用 if-none-match 取出緩存數據
      let data = cache[ifNoneMatch];
      if (!ifNoneMatch) {
        //  沒有 if-none-match
        res.exist = STATUS.NO_IF_NONE_MATCH;
      } else if (!data) {
        //  if-none-match 不匹配
        res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH;
      } else {
        //  if-none-match 有效
        return { exist: STATUS.HAS_FRESH_CACHE, data, etag: ifNoneMatch };
      }
      //  分解緩存，取出 etag 與 緩存數據
      res.etag = Object.keys(cache)[0];
      res.data = Object.values(cache)[0];
      return res;
    },
    //  0501
    //  設置 user 緩存
    async set(id, data) {
      if (ENV.isNoCache) {
        return false;
      }
      let etag = await cacheType.set(id, data);
      return etag;
    },
    //  0501
    //  清除緩存
    async delList(list) {
      console.log("@要刪除的 list => ", list);
      if (list.length) {
        return await cacheType.clear(list);
      }
      return false;
    },
  };
}
module.exports = {
  //  0504
  getNews,
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
