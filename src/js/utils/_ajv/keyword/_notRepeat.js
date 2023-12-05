import { AJV } from "../../../../../config/constant";

const keyword = "_notRepeat";
const message = "沒有要改就別鬧了";
function validate(schema, data, parentSchema, dataCtx) {
  let { _old } = data;
  if (!_old) {
    console.warn("來自 keyword diff 的警告，驗證數據未提供 _old");
    return true;
  }
  let error = { keyword: "myKeyword", message };
  let params_errors = Object.entries(data).reduce((acc, [prorperty, value]) => {
    let valid = true;
    if (schema.includes(prorperty)) {
      let _value = _old[prorperty];
      if (typeof _value === "number") {
        value *= 1;
      }
      valid = value !== _old[prorperty];
    }
    if (!valid) {
      acc.push({
        keyword,
        params: { [AJV.ERROR_PARAMS._notRepeat]: prorperty },
      });
    }
    return acc;
  }, []);
  if (params_errors.length) {
    error.params = { errors: params_errors };
    validate.errors = [error];
  }
  return !params_errors.length;

  for (let property in schema) {
  }
  if (schema !== data) {
    return true;
  }
  validate.errors = [{ keyword, myKeyword, message: "若沒有要更新就別鬧" }];
  return false;
}
// export default {
//   keyword,
//   $data: true,
//   type: "object",
//   schemaType: 'array',
//   validate,
//   errors: true,
// };

export default {
  keyword,
  type: "object",
  schemaType: "array",
  validate,
  errors: true,
};
