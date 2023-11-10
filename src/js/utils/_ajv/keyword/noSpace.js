const keyword = "noSpace";
const myKeyword = true;
function validate(schema, data, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  let regux = /\s/g;
  if (!regux.test(data)) {
    return true;
  }
  validate.errors = [{ keyword, myKeyword, message: "不可包含空格" }];
  return false;
}
export default {
  keyword,
  type: "string",
  schemaType: "boolean",
  validate,
  errors: true,
};
