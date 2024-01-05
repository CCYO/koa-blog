const Ajv2019 = require("ajv/dist/2019");
const { isEmailExist } = require("../../../controller/user");

const keyword = "_isEmailExist";

async function validate(schema, email, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  let { errno, msg: message } = await isEmailExist(email);
  if (!errno) {
    return true;
  }
  let errors = [{ keyword }];
  let params = { errors };
  let invalid_errors = [{ keyword: "myKeyword", params, message }];
  throw new Ajv2019.ValidationError(invalid_errors);
}

module.exports = {
  keyword,
  type: "string",
  async: true,
  schemaType: "boolean",
  validate,
  errors: true,
};
