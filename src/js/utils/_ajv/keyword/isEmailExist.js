import Ajv from "ajv";
const keyword = "isEmailExist";
const myKeyword = true;
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
  let errors = [{ keyword, myKeyword, message: msg[key] }];
  throw new Ajv.ValidationError(errors);
}

export default {
  keyword,
  async: true,
  type: "string",
  schemaType: "boolean",
  validate,
  errors: true,
};
