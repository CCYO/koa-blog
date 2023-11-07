const keyword = "_required";
const myKeyword = true;
function _required(schema, data, parentSchema, dataCtx) {
  console.log(this);
  if (!schema) {
    return true;
  }
  let valid = data.trim().length > 0;
  if (valid) {
    return true;
  }
  let { instancePath } = dataCtx;
  _required.errors = [{ keyword, instancePath, message: "必填", myKeyword }];
  return false;
}

export default {
  keyword,
  type: "string",
  schemaType: "boolean",
  validate: _required,
  errors: true,
};
