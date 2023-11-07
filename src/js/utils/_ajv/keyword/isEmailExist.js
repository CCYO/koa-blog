// import _axios from '../../../_axios'
import Ajv from "ajv";
const keyword = "isEmailExist";
const myKeyword = true;
async function isEmailExist(schema, data, parentSchema, dataCtx) {
  console.log("@isEmailExist");
  if (!schema) {
    return true;
  }
  const key = "email";
  let { errno, msg } = await this.$$axios.post("/api/user/isEmailExist", {
    [key]: data,
  });
  if (errno) {
    console.log("失敗", msg);
    let { instancePath } = dataCtx;
    let message = msg[key];
    let errors = [{ keyword, myKeyword, instancePath, message }];
    throw new Ajv.ValidationError(errors);
  }
  console.log("成功");
  return true;
}

export default {
  keyword,
  async: true,
  type: "string",
  schemaType: "boolean",
  validate: isEmailExist,
  errors: true,
};
