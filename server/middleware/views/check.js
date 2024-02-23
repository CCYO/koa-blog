//  0501
async function isSelf(ctx, next) {
  let me = ctx.session.user ? ctx.session.user.id : undefined;
  let currentUser = ctx.params.id * 1;
  //  若是自己的ID，跳轉到個人頁面
  if (me === currentUser) {
    return ctx.redirect("/self");
  }
  await next();
}
//  0501
/** Middleware 針對 VIEW 請求，驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else {
    let url = new URL(ctx.href);
    let search = url.search;
    let from = encodeURIComponent(url.pathname + search);
    // ctx.redirect(`/permission/${ErrRes.PAGE.NO_LOGIN.errno}?from=${from}`);
    ctx.redirect(`/login?from=${from}`);
  }
  return;
}
async function skipLogin(ctx, next) {
  if (ctx.session.user) {
    //  若已登入，跳轉到個人頁面
    ctx.redirect("/self");
    return;
  }
  await next();
  //  避免登入狀態時點擊上一頁，到達未登入狀態才允許看得到的頁面，故不允許緩存
  ctx.set({
    ["Cache-Control"]: "no-store",
  });
}
module.exports = {
  skipLogin,
  //  0501
  isSelf,
  //  0501
  login,
};
