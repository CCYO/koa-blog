const { URL } = require("url");
//  0505
const { ErrRes, ErrModel, MyErr } = require("../../model");
//  0505
async function mustBeOwner(ctx, next) {
  // let { owner_id } = ctx.request.body
  let user_id = ctx.session.user.id;
  // if( owner_id !== user_id ){
  //     ctx.body = new ErrModel(ErrRes.PERMISSION.NOT_OWNER)
  //     return
  // }
  await next();
  const { errno, data } = ctx.body;
  if (errno) {
    return;
  }
  const url = new URL(ctx.href);
  const pathname = url.pathname;
  const regux_updateBlog = /^\/api\/blog(\/)?/;
  const is_updateBlog = regux_updateBlog.test(pathname);
  if (is_updateBlog) {
    if (data.author.id !== user_id) {
      ctx.body = new ErrModel(ErrRes.PERMISSION.NOT_OWNER);
    }
    return;
  }
}

//  ------------------------------------------------------
/** Middleware 針對 API 請求，驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else {
    ctx.body = new ErrModel(ErrRes.NEWS.READ.NO_LOGIN);
  }
  return;
}

module.exports = {
  //  0505
  mustBeOwner,
  //  ---------------
  login,
};
