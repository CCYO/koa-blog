/**
 * @description 校驗 user 的 資料格式
 */
const Ajv2019 = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const AjvErrors = require("ajv-errors");

const VALIDATE_CONFIG = require("./config");
const _notOrigin = require("./keyword/_notOrigin");
const _noSpace = require("./keyword/_noSpace");

const schema_blog = require("./schema/blog");
const schema_update = require("./schema/blog_update");

const handle_error = require("./handle_error");

const ajv = new Ajv2019({
  strict: false,
  allErrors: true,
  $data: true,
});
addFormats(ajv);
//  為 ajv 添加 format 關鍵字，僅適用 string 與 number
AjvErrors(ajv);
//  可使用 errorMessage 自定義錯誤提示

let schema_list = [schema_blog, schema_update];
ajv.addSchema(schema_list);
ajv.addKeyword(_notOrigin);
ajv.addKeyword(_noSpace);

module.exports = (type) => {
  let id = `${VALIDATE_CONFIG.URL}/${type}.json`;
  let validate = ajv.getSchema(id);
  return handle_error.bind(validate);
};
