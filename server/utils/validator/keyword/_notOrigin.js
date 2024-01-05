const VALIDATE_CONFIG = require("../config");

const keyword = "_notOrigin";
const message = "沒有要改就別鬧了";
function validate(schema, data, parentSchema, dataCtx) {
  let { _origin } = data;
  let error = { keyword: "myKeyword", message };
  if (!_origin) {
    throw new Error("來自 keyword _notOrigin 的錯誤，驗證數據未提供 _origin");
  }
  let params_errors = Object.entries(data).reduce((acc, [prorperty, value]) => {
    let valid = true;
    if (schema.includes(prorperty)) {
      let _value = _origin[prorperty];
      if (typeof _value === "number") {
        value *= 1;
      }
      valid = value !== _origin[prorperty];
    }
    if (!valid) {
      acc.push({
        keyword,
        params: { [VALIDATE_CONFIG.ERROR_PARAMS._notOrigin]: prorperty },
      });
      //   diff.errors item = { instancePath, message: "與原資料相同" };
    }
    return acc;
  }, []);
  if (params_errors.length) {
    error.params = { errors: params_errors };
    validate.errors = [error];
  }
  return !params_errors.length;
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
  $data: true,
  //    data type
  type: "object",
  //    schema 針對此 keyword 設定的格式限制
  schemaType: "array",
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
