import { AJV } from "../../../../../config/constant";

const keyword = "_noSpace";
const message = "不可包含空格";
function validate(schema, data, parentSchema, dataCtx) {
  let error = { keyword: "myKeyword", message };
  let reg = /\s/g;
  let params_errors = Object.entries(data).reduce((acc, [prorperty, value]) => {
    if (typeof value === "string") {
      let valid = !reg.test(value);
      if (!valid) {
        acc.push({
          keyword,
          params: { [AJV.ERROR_PARAMS._noSpace]: prorperty },
        });
      }
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
