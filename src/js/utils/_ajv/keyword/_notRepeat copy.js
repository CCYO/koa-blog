import { AJV } from "../../../../../config/constant";

const keyword = "_notRepeat";
const message = "沒有要改就別鬧了";
function validate(schema, data, parentSchema, dataCtx) {
  let { _old } = data;
  if (!_old) {
    console.warn("來自 keyword _notEmpty 的警告，驗證數據未提供 _old");
    return true;
  }
  let error = { keyword: "myKeyword", message };
  let entries = Object.entries(data);
  function check(obj) {
    let entries = obj.entries();
    for (let [prop, value] of entries) {
      let valid = true;
      function check(schema, prop, _old) {
        if (schema.includes(prop)) {
          let _old_value = _old[prop];
          let type = typeof _old_value;
          if (type === "object") {
            check(schema[prop]);
          } else if (type === "number") {
            value *= 1;
          }
          return value !== _old_value;
        }
      }
    }
  }
  let params_errors = entries.reduce((acc, [prorperty, value]) => {
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
}

export default {
  keyword,
  type: "object",
  schemaType: "array",
  validate,
  errors: true,
};
