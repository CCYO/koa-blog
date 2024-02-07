/**
 * @description middleware validate
 */
const { TYPE } = require("../../../utils/validator/config");
const validator = require("../../../utils/validator");
const C_BlogImgAlt = require("../../../controller/blogImgAlt");
/** Middleware - 校驗 USER 資料
 * @param {*} ctx
 * @param {function} next
 * @returns
 */
module.exports = async (ctx, next) => {
  let action;
  let validate_result = [];
  let method = ctx.method.toUpperCase();
  let reg = /\/api\/album(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    case "PATCH-/":
      action = "更新ALT";
      let { data } = await C_BlogImgAlt.findWholeInfo({
        author_id: ctx.session.user.id,
        blog_id: ctx.request.body.blog_id,
        alt_id: ctx.request.body.alt_id,
      });
      let _origin = { alt: data.alt };
      let newData = { ...ctx.request.body, _origin };
      validate_result = await validator.alt(TYPE.ALT_UPDATE)(newData);
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
