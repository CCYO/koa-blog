// import _axios from '../../../_axios'

async function isEmailExist(schema, data, parentSchema, dataCtx) {
  if (!schema) {
    return true;
  }
  const key = "email";
  let payload = { ...data };
  delete payload.$$axios;
  let { errno, msg } = await data.$$axios.post("/api/user/isEmailExist", {
    [key]: payload,
  });
  if (errno) {
    let { instancePath } = dataCtx;
    let e = new Error();
    let message = msg[key];
    let keyword = "isEmailExist";
    let params = { myKeyword: true };
    e.errors = [{ keyword, params, instancePath, message }];
    throw e;
  }
  return true;
}

export default {
  keyword: "isEmailExist",
  async: true,
  type: "string",
  schemaType: "boolean",
  validate: isEmailExist,
  errors: true,
};
