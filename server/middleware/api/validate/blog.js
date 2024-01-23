/**
 * @description middleware validate
 */
const { TYPE } = require("../../../utils/validator/config");
const validator = require("../../../utils/validator");
const C_Blog = require("../../../controller/blog");
const { MyErr } = require("../../../model");
/** Middleware - 校驗 USER 資料
 * @param {*} ctx
 * @param {function} next
 * @returns
 */
module.exports = async (ctx, next) => {
  let action;
  let validate_result = [];
  let method = ctx.method.toUpperCase();
  let reg = /\/api\/blog(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    // case "POST-/":
    //   action = "建立BLOG";
    //   validate_result = await validator.user(TYPE.LOGIN)(ctx.request.body);
    //   break;
    case "PATCH-/":
      action = "更新BLOG";
      let opts = {
        author_id: ctx.session.user.id,
        blog_id: ctx.request.body.blog_id,
      };
      let resModel = await C_Blog.findWholeInfo(opts);
      let { errno, data } = resModel;
      if (errno) {
        throw new MyErr({
          ...resModel,
          error: `${action}/${blog_id}時，發生錯誤`,
        });
      }
      let { title, html, show } = data;
      let _origin = { title, html, show };
      let newData = { ...ctx.request.body, _origin };
      validate_result = await validator.blog(TYPE.BLOG_UPDATE)(newData);
      break;
  }
  //    validate_result [ item, ... ]
  //    item { <field_name>, <valid>, <value|message> }
  let invalid_list = validate_result.filter(({ valid }) => !valid);
  if (invalid_list.length) {
    console.log("VALIDATE 捕捉到資料校驗錯誤");
    throw new Error("VALIDATE 捕捉到資料校驗錯誤");
  }
  return await next();
};
