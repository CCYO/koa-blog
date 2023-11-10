const keyword = "diff";
const myKeyword = true;
function validate(schema, data, parentSchema, dataCtx) {
  if (schema !== data) {
    return true;
  }
  validate.errors = [{ keyword, myKeyword, message: "若沒有要更新就別鬧" }];
  return false;
}
export default {
  keyword,
  $data: true,
  type: ["string", "number", "boolean"],
  schemaType: ["string", "number", "boolean", "null"],
  validate,
  errors: true,
};
