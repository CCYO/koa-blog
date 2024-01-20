//  0404
const { SuccModel } = require("../../model");
const { DEFAULT } = require("../../config");
const S_Cache = require("../../server/cache");

async function reset(ctx, next) {
  await next();
  let { data } = ctx.body;
  console.log(`@ 重設 user/${data.id} 的 session`);
  ctx.session.user = { ...data, news: ctx.session.user.news };
}

//  ----------------------------------------
//  移除登入者session
async function remove(ctx) {
  console.log(`@ 移除 使用者user_id:${ctx.session.user.id} 的 session`);
  ctx.session = null;
  ctx.body = new SuccModel({ data: "成功登出" });
}
//  設置登入者session
async function set(ctx, next) {
  await next();
  let { errno, data } = ctx.body;
  if (errno) {
    return;
  }
  if (!ctx.session.user) {
    console.log(
      `@ 設置 使用者user_id:${data.id} 的 session，包含【session.user -> 使用者公開資訊】以及【session.news -> 最新通知數據】`
    );
    ctx.session.user = {
      ...data,
      news: DEFAULT.USER.SESSION_NEWS,
    };
  }
}

//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
//  依據 Cache News 判斷 session.news 過期與否，並將兩者視情況取用、更新、設置
async function news(ctx, next) {
  let default_news = {
    list: { confirm: [], unconfirm: [] },
    num: ctx.session.user.news.num,
  };
  const { status } = ctx.request.body;
  const { id, news: sessionNews } = ctx.session.user;
  let cache = S_Cache.getTYPE(DEFAULT.CACHE.TYPE.NEWS);
  let hasNews = await cache.has(id);
  //  若有新通知
  if (hasNews) {
    console.log(
      `@ 根據 cache/${DEFAULT.CACHE.TYPE.NEWS} 得知，user/${id} 有新通知`
    );
    //  清除請求數據
    ctx.request.body = {};
    await cache.del([id]);
    //  恢復session.news預設值
    ctx.session.user.news = DEFAULT.USER.SESSION_NEWS;
  } else if (status === DEFAULT.NEWS.FRONT_END_STATUS.CHECK) {
    console.log(
      `@ user/${id} 前端已經取得當前所有通知，後端也暫無新的news條目`
    );
    default_news.hasNews = false;
    let data = { ...ctx.session.user, news: default_news };
    ctx.body = new SuccModel({ data });
    return;
  } else if (
    status === DEFAULT.NEWS.FRONT_END_STATUS.FIRST &&
    ctx.session.user.news.hasNews !== null
  ) {
    console.log(`@ user/${id} 直接使用緩存 session.news`);
    ctx.body = new SuccModel({ data: ctx.session.user });
    return;
  }
  console.log(`@ user/${id} 向DB查詢 news數據`);
  await next();

  let { errno, data } = ctx.body;
  if (errno) {
    return;
  }
  //  更新 ctx.session.news
  sessionNews.hasNews = hasNews;
  for (let prop in data.news.list) {
    sessionNews.list[prop] = [
      ...sessionNews.list[prop],
      ...data.news.list[prop],
    ];
  }
  sessionNews.num = data.news.num;
  console.log(`@ user/${id} 的 session.user.news 已更新`);
  //  ctx.body { errno, data: { ctx.session.user } }
  //  ctx.session.user { news, ...user session data }
  //  news { list, num, hasNews }
  //  news.list {
  //      confirm: [{ type, id, confirm, timestamp, <fans|blogs|comments> }, ...],
  //      unconfirm: [{ type, id, confirm, timestamp, <fans|blogs|comments> }, ...],
  //  }
  //  news.num { confirm, unconfirm, total }
  let responseData = { ...ctx.session.user, news: data.news };
  ctx.body.data = responseData;
  //  提供前端確認hasNews
}
module.exports = {
  reset,
  //  ---------------
  news,
  remove,
  set,
};
