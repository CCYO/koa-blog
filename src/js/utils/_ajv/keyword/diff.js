function diff(schema, data, parentSchema, dataCtx) {
  if (schema !== data) {
    return true;
  }
  let { instancePath } = dataCtx;
  let keyword = "diff";
  let myKeyword = true;
  let params = { myKeyword: true };
  diff.errors = [
    { keyword, myKeyword, params, instancePath, message: "若沒有要更新就別鬧" },
  ];
  return false;
}
export default {
  keyword: "diff",
  $data: true,
  type: ["string", "number", "boolean"],
  schemaType: ["string", "number", "boolean", "null"],
  validate: diff,
  errors: true,
};
