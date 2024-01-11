//  0501
const S_Cache = require("../../server/cache");
//  0504
//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
async function news(ctx, next) {
  const { id } = ctx.session.user;
  let cache = await S_Cache.getNews();
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
    await cache.delList([id]);
    //  恢復預設值
    ctx.session.news = getSessionNews(ctx);

    function getSessionNews(ctx) {
      return {
        errno: undefined,
        data: {
          news: {
            newsList: {
              confirm: [],
              unconfirm: [],
            },
            num: {
              unconfirm: 0,
              confirm: 0,
              total: 0,
            },
          },
          me: ctx.session.user,
        },
      };
    }
  }
  // 移除系統「通知有新訊息」的緩存
  console.log(`@ user/${id} 向DB查詢 news數據`);
  await next();

  let {
    errno,
    data: {
      news: {
        newsList: { unconfirm, confirm },
        num,
      },
    },
  } = ctx.body;
  //  ctx.session.news 與 ctx.body 同格式
  let cacheNews = ctx.session.news.data.news;
  //  更新 unconfirm, confirm, num, errno
  cacheNews.newsList.unconfirm = [
    ...unconfirm,
    ...cacheNews.newsList.unconfirm,
  ];
  cacheNews.newsList.confirm = [...confirm, ...cacheNews.newsList.confirm];
  cacheNews.num = num;
  ctx.session.news.errno = errno;
  //  提供前端確認hasNews
  ctx.body.data.news.hasNews = hasNews;
  console.log(`@ user/${id} 的 session.news 完成緩存`);
}
//  0503
//  當 cache 有變動時
async function modify(ctx, next) {
  await next();
  if (ctx.body.hasOwnProperty("cache")) {
    await S_Cache.modify(ctx.body.cache);
    delete ctx.body.cache;
  }
  return;
}
module.exports = {
  //  0504
  news,
  //  0504
  modify,
};
