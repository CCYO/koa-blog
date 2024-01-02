import Ajv from "ajv";
const keyword = "_isEmailExist";
async function validate(schema, data, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  const key = "email";
  let { errno, msg } = await this.$$axios.post("/api/user/isEmailExist", {
    [key]: data,
  });
  if (!errno) {
    return true;
  }
  let errors = [{ keyword }];
  let params = { errors };
  let invalid_errors = [{ keyword: "myKeyword", params, message: msg }];
  throw new Ajv.ValidationError(invalid_errors);
}

export default {
  keyword,
  async: true,
  type: "string",
  schemaType: "boolean",
  validate,
  errors: true,
};
