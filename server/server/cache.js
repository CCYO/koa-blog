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
        console.log(`取得 cache ${type}/${id} 時，發現不存在`);
        //  沒有緩存
        return res;
      }
      let kv = await cache.get(id);
      let [etag, data] = Object.entries(kv)[0];
      res = { etag, data };
      if (!ifNoneMatch) {
        //  沒有 if-none-match
        res.exist = STATUS.NO_IF_NONE_MATCH;
        console.log(`取得 cache ${type}/${id} 時，沒有提供 if-none-match`);
      } else if (etag !== ifNoneMatch) {
        //  if-none-match 不匹配
        res.exist = STATUS.IF_NONE_MATCH_IS_NO_FRESH;
        console.log(`取得 cache ${type}/${id} 時，if-none-match 已過期`);
      } else {
        //  if-none-match 有效
        res.exist = STATUS.HAS_FRESH_CACHE;
        console.log(`取得 cache ${type}/${id} 時，使用有效緩存`);
      }
      return res;
    },
    //  設置緩存，並返回緩存數據所生成的etag
    async set(id, data) {
      if (ENV.isNoCache) {
        return false;
      }
      let etag = await cache.set(id, data);
      console.log(`設定 cache ${type}/${id} 完成，並生成 etag: ${etag}`);
      return etag;
    },
    //  清除緩存
    async del(id_list) {
      if (ENV.isNoCache) {
        return false;
      }
      console.log(`@ 完成刪除 cache/${type} 內的指定 id_list => , ${id_list}`);
      return await cache.del(list);
    },
  };
}
module.exports = {
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
