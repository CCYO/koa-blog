//  0501
const S_Cache = require("../../server/cache");
const {
  DEFAULT: {
    USER,
    CACHE: { TYPE },
  },
} = require("../../config");

//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
//  依據 Cache News 判斷 session.news 過期與否，並將兩者視情況取用、更新、設置
async function news(ctx, next) {
  const { id } = ctx.session.user;
  // let cache = await S_Cache.getNews();
  let cache = S_Cache.getTYPE(TYPE.NEWS);
  // let hasNews = cache.has(id);
  let hasNews = cache.has(id);
  let { excepts } = ctx.request.body;
  //  若為頁面初次請求||已確認前端仍有未取得的通知數據，且「通知」數據沒有變動，並有緩存數據
  if (!excepts && !hasNews && ctx.session.news.errno === 0) {
    console.log(`@ user/${id} 直接使用緩存 session.news`);
    ctx.body = ctx.session.news;
    return;
  }
  //  若有新通知
  if (hasNews) {
    ctx.request.body.excepts = undefined;
    console.log(`@ 因為 user/${id} 的通知數據有變動`);
    //  從系統緩存cacheNews中移除當前userId
    // await cache.delList([id]);
    await cache.del([id]);
    //  恢復預設值
    ctx.session.news = USER.SESSION_NEWS(ctx);
  }
  // 移除系統「通知有新訊息」的緩存
  console.log(`@ user/${id} 向DB查詢 news數據`);
  await next();

  let { errno, data } = ctx.body;
  let {
    news: {
      // newsList: { unconfirm, confirm },
      newsList,
      num,
    },
  } = data;
  //  提供前端確認hasNews
  data.news.hasNews = hasNews;

  //  ctx.session.news 與 ctx.body 同格式
  let sessionNews = ctx.session.news;
  sessionNews.errno = errno;
  let sessionNewsData = sessionNews.data.news;
  for (let prop in newsList) {
    sessionNewsData.newsList[prop] = [
      ...newsList[prop],
      sessionNewsData.newsList[prop],
    ];
  }
  //  更新 unconfirm, confirm, num, errno
  // cacheNews.newsList.unconfirm = [
  //   ...unconfirm,
  //   ...cacheNews.newsList.unconfirm,
  // ];
  // cacheNews.newsList.confirm = [...confirm, ...cacheNews.newsList.confirm];
  sessionNewsData.num = num;
  console.log(`@ user/${id} 的 session.news 完成緩存`);
}
//  0503
//  處理 resModel.cache
async function modify(ctx, next) {
  await next();
  if (ctx.body.hasOwnProperty("cache")) {
    // await S_Cache.modify(ctx.body.cache);
    await S_Cache.modify(ctx.body.cache);
    // for (let [type, list] of Object.entries(ctx.body.cache)) {
    //   let cache = S_Cache.getTYPE(type);

    // if (type === TYPE.NEWS) {
    //  提醒使用者的通知數據有變動，要重新從DB讀取
    // let cache = await getNews();
    // await cache.addList(list);
    //   await cache.add(list);
    // } else if (ENV.isNoCache) {
    //   continue;
    // } else {
    //  移除既存的頁面緩存數據，要重新從DB讀取
    // let cache = await getTYPE(type);
    // await cache.delList(list);
    //   await cache.del(list);
    // }
  }
  delete ctx.body.cache;
  return;
}

module.exports = {
  //  0504
  news,
  //  0504
  modify,
};
