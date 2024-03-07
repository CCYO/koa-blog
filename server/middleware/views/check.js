/**
 * 系統直接調用的緩存處理
 */
const Redir = require("../../utils/redir");

//  若是當前使用者，跳往個人頁
async function isSelf(ctx, next) {
  let me = ctx.session.user ? ctx.session.user.id : undefined;
  let currentUser = ctx.params.id * 1;
  //  若是自己的ID，跳轉到個人頁面
  if (me === currentUser) {
    return ctx.redirect("/self");
  }
  await next();
}

/** 驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else {
    Redir.login(ctx.href);
  }
  return;
}
//  登入狀態鑿直接跳往個人頁，且不允許前端緩存
async function skipLogin(ctx, next) {
  if (ctx.session.user) {
    //  若已登入，跳轉到個人頁面
    ctx.redirect("/self");
    return;
  }
  await next();
}
module.exports = {
  skipLogin,
  //  0501
  isSelf,
  //  0501
  login,
};
