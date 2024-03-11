const {
  ENV,
  DEFAULT: { CACHE },
} = require("../../config");
const C_CacheNews = require("../../controller/cache_news");
const C_CachePage = require("../../controller/cache_page");
//  處理 resModel.cache
async function modify(ctx, next) {
  await next();
  if (!ctx.body.hasOwnProperty("cache")) {
    return;
  }

  for (let [type, list] of Object.entries(ctx.body.cache)) {
    if (!list.length) {
      continue;
    }
    if (type === CACHE.TYPE.NEWS) {
      //  提醒使用者的通知數據有變動，要重新從DB讀取
      await C_CacheNews.addList(list);
    } else if (ENV.isNoCache) {
      continue;
    } else {
      //  移除既存的頁面緩存數據，要重新從DB讀取
      await C_CachePage.removeList(type, list);
    }
  }
  delete ctx.body.cache;
}

module.exports = {
  modify,
};
