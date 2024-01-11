//  0404
const { SuccModel } = require("../../model");

async function reset(ctx, next) {
  await next();
  let { data } = ctx.body;
  console.log(`@ 重設 user/${data.id} 的 session`);
  ctx.session.user = ctx.session.news.data.me = data;
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
module.exports = {
  reset,
  //  ---------------
  remove,
  set,
};
