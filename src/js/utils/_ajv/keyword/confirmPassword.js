import Ajv from "ajv";
const keyword = "confrimPassword";
const myKeyword = true;
async function validate(schema, data, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  let { errno, msg: message } = await this.$$axios.post(
    CONST.API.PASSWORD,
    data
  );
  if (!errno) {
    return true;
  }
  let errors = [{ keyword, myKeyword, message }];
  throw new Ajv.ValidationError(errors);
}
export default {
  keyword,
  type: "string",
  async: true,
  schemaType: "boolean",
  validate,
  errors: true,
};
