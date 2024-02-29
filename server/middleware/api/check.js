const { ErrRes, ErrModel } = require("../../model");

/** Middleware 針對 API 請求，驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else if (ctx.path === "/api/news") {
    ctx.body = new ErrModel(ErrRes.NEWS.READ.NO_LOGIN);
  } else {
    ctx.body = new ErrModel(ErrRes.PAGE.NO_LOGIN);
  }
  return;
}

module.exports = {
  login,
};
