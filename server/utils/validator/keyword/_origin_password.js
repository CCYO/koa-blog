const Ajv = require("ajv");
const { login } = require("../../../../server/controller/user");

const keyword = "_origin_password";
const message = "origin_password 密碼驗證錯誤";

async function validate(schema, origin_password, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  let { email } = dataCtx.rootData.$$me;
  let { errno } = await login(email, origin_password);

  if (!errno) {
    return true;
  }
  let errors = [{ keyword }];
  let params = { errors };
  let invalid_errors = [{ keyword: "myKeyword", params, message }];
  throw new Ajv.ValidationError(invalid_errors);
  // if (errno) {
  //   let { instancePath } = dataCtx;
  //   throw new Ajv2019.ValidationError([{ instancePath, message }]);
  // }
  // return true;
}

// function validate(schema, data, parentSchema, dataCtx) {
//   if (schema !== data || !schema) {
//     return true;
//   }
//   let { instancePath } = dataCtx;
//   validate.errors = [{ instancePath, message: "與原資料相同" }];
//   return false;
// }
// export default {
//   keyword,
//   type: "object",
//   schemaType: "array",
//   validate,
//   errors: true,
// };

module.exports = {
  keyword,
  //    data type
  type: "string",
  //    schema 針對此 keyword 設定的格式限制
  schemaType: "boolean",
  async: true,
  validate,
  // validate: function diff(schema, data, parentSchema, dataCtx) {
  //   if (schema !== data || !schema) {
  //     return true;
  //   }
  //   let { instancePath } = dataCtx;
  //   diff.errors = [{ instancePath, message: "與原資料相同" }];
  //   return false;
  // },
  errors: true,
};

// ajv.addKeyword({
//     keyword: "checkOriginPassword",
//     type: "string",
//     schemaType: "boolean",
//     async: true,
//     validate,
//     errors: true,
//   });
