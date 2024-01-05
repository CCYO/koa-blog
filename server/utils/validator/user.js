/**
 * @description 校驗 user 的 資料格式
 */
const Ajv2019 = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const AjvErrors = require("ajv-errors");

const VALIDATE_CONFIG = require("./config");
const _notOrigin = require("./keyword/_notOrigin");
const _origin_password = require("./keyword/_origin_password");
const _isEmailExist = require("./keyword/_isEmailExist");
const _noSpace = require("./keyword/_noSpace");

const schema_default = require("./schema/default");
const schema_setting = require("./schema/setting");
const schema_register = require("./schema/register");
const schema_login = require("./schema/login");
const schema_email = require("./schema/email");

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

let schema_list = [
  schema_default,
  schema_register,
  schema_login,
  schema_email,
  schema_setting,
];
ajv.addSchema(schema_list);

ajv.addKeyword(_notOrigin);
ajv.addKeyword(_origin_password);
ajv.addKeyword(_isEmailExist);
ajv.addKeyword(_noSpace);

module.exports = (type) => {
  let id = `${VALIDATE_CONFIG.URL}/${type}.json`;
  let validate = ajv.getSchema(id);
  return handle_error.bind(validate);
};
