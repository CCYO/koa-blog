//  0404
const { SuccModel } = require("../../model");
//  0404
//  移除登入者session
async function remove(ctx) {
  ctx.session = null;
  ctx.body = new SuccModel({ data: "成功登出" });
}
//  0404
//  設置登入者session
async function set(ctx, next) {
  await next();
  let { errno, data } = ctx.body;
  if (errno) {
    return;
  }
  if (!ctx.session.user) {
    console.log(`@ 設置 user/${data.id} 的 session`);
    ctx.session.user = data;
    ctx.session.news = getSessionNews(ctx);
  }
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
async function reset(ctx, next) {
  await next();
  let { data } = ctx.body;
  console.log(`@ 重設 user/${data.id} 的 session`);
  ctx.session.user = ctx.session.news.data.me = data;
}
module.exports = {
  reset,
  remove,
  set,
};
