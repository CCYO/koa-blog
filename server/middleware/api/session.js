const C_CacheNews = require("../../controller/cache_news");
const { log } = require("../../utils/log");
const { SuccModel } = require("../../model");
const { DEFAULT } = require("../../config");
//  reset session
async function reset(ctx, next) {
  await next();
  let { data } = ctx.body;
  log(`重設 user/${data.id} 的 session`);
  ctx.session.user = { ...data, news: ctx.session.user.news };
}
//  remove session
async function remove(ctx) {
  log(`移除 使用者user_id:${ctx.session.user.id} 的 session`);
  ctx.session = null;
  ctx.body = new SuccModel({ data: "成功登出" });
}
//  set session
async function set(ctx, next) {
  await next();
  let { errno, data } = ctx.body;
  if (errno) {
    return;
  }
  if (!ctx.session.user) {
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
  //  body { status, excepts }
  const { status } = ctx.request.body;
  const { id, news: sessionNews } = ctx.session.user;
  let resModel = await C_CacheNews.isExist(id);
  let hasNews = resModel.errno ? false : true;
  //  若有新通知
  if (hasNews) {
    log(`根據 cache/${DEFAULT.CACHE.TYPE.NEWS} 得知，user/${id} 有新通知`);
    //  清除請求數據
    ctx.request.body = {};
    await C_CacheNews.removeList([id]);
    //  恢復session.news預設值
    ctx.session.user.news = DEFAULT.USER.SESSION_NEWS;
  } else if (status === DEFAULT.NEWS.FRONT_END_STATUS.CHECK) {
    log(`user/${id} 前端已經取得當前所有通知，後端也暫無新的news條目`);
    default_news.hasNews = false;
    let data = { ...ctx.session.user, news: default_news };
    ctx.body = new SuccModel({ data });
    return;
  } else if (
    status === DEFAULT.NEWS.FRONT_END_STATUS.FIRST &&
    ctx.session.user.news.hasNews !== null
  ) {
    log(`user/${id} 直接使用緩存 session.news`);
    ctx.body = new SuccModel({ data: ctx.session.user });
    return;
  }
  log(`user/${id} 向DB查詢 news數據`);
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
  log(`user/${id} 的 session.user.news 已更新`);
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
}
module.exports = {
  reset,
  news,
  remove,
  set,
};
