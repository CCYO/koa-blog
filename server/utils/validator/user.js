/**
 * @description 校驗 user 的 資料格式
 */
const CONS = require("./constant");
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

const { VALIDATE } = require("../../conf/constant");

const Ajv2019 = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const AjvErrors = require("ajv-errors");
const { MyErr } = require("../../model");
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

/*
ajv.addKeyword({
  keyword: "checkOriginPassword",
  type: "string",
  schemaType: "boolean",
  async: true,
  validate: async function checkOriginPassword(
    schema,
    origin_password,
    parentSchema,
    dataCtx
  ) {
    if (!schema) {
      return true;
    }
    let { email } = dataCtx.rootData.$$me;
    let { errno, msg: message } = await login(email, origin_password);
    if (errno) {
      let { instancePath } = dataCtx;
      throw new Ajv2019.ValidationError([{ instancePath, message }]);
    }
    return true;
  },
  errors: true,
});
ajv.addKeyword({
  keyword: "diff",
  $data: true,
  type: ["string", "number"],
  schemaType: ["string", "number", "null"],
  validate: function diff(schema, data, parentSchema, dataCtx) {
    if (schema !== data || !schema) {
      return true;
    }
    let { instancePath } = dataCtx;
    diff.errors = [{ instancePath, message: "與原資料相同" }];
    return false;
  },
  errors: true,
});
ajv.addKeyword({
  keyword: "noSpace",
  type: "string",
  schemaType: "boolean",
  validate: function noSpace(schema, data, parentSchema, dataCtx) {
    if (!schema) {
      return true;
    }
    let regux = /\s/g;
    if (regux.test(data)) {
      let { instancePath } = dataCtx;
      noSpace.errors = [{ instancePath, message: "不可包含空格" }];
      return false;
    }
    return true;
  },
  errors: true,
});
ajv.addKeyword({
  keyword: "isExist",
  type: "string",
  async: true,
  $data: true,
  schemaType: "boolean",
  validate: async function isExist(schema, email, parentSchema, dataCtx) {
    if (!schema) {
      return true;
    }
    let { errno, msg: message } = await isEmailExist(email);
    if (!errno) {
      return true;
    }
    let { instancePath } = dataCtx;
    throw new Ajv2019.ValidationError([{ instancePath, message }]);
  },
  errors: true,
});
*/

/*
const REGISTER = {
  $id: `${URL}/register.json`,
  $async: true,
  type: "object",
  properties: {
    email: { $ref: "defs.json#/definitions/email" },
    password: { $ref: "defs.json#/definitions/password" },
    password_again: { $ref: "defs.json#/definitions/password_again" },
  },
  dependentSchemas: {
    email: {
      properties: {
        email: {
          isExist: true,
        },
      },
    },
  },
  required: ["email", "password", "password_again"],
  errorMessage: { ...COMMON_ERR_MSG },
};
const LOGIN = {
  $id: `${URL}/login.json`,
  type: "object",
  properties: {
    email: { $ref: "defs.json#/definitions/email" },
    password: { $ref: "defs.json#/definitions/password" },
  },
  required: ["email", "password"],
  errorMessage: { ...COMMON_ERR_MSG },
};

const SETTING = {
  $id: `${URL}/setting.json`,
  type: "object",
  $async: true,
  minProperties: 2,
  properties: {
    $$me: {
      type: "object",
      errorMessage: {
        type: "$$me需是object",
      },
    },
    email: {
      diff: { $data: "1/$$me/email" },
      $ref: "defs.json#/definitions/email",
    },
    age: {
      diff: { $data: "1/$$me/age" },
      $ref: "defs.json#/definitions/age",
    },
    nickname: {
      diff: { $data: "1/$$me/nickname" },
      $ref: "defs.json#/definitions/nickname",
    },
    password_orgin: {
      
    },
    password: {
      diff: { $data: "1/origin_password" },
      $ref: "defs.json#/definitions/password",
    },
    password_again: {

    },
    avatar: {
      $ref: "defs.json#/definitions/avatar",
    },
  },
  dependentSchemas: {
    // avatar: {
    //     properties: {
    //         avatar_hash: {
    //             diff: { $data: '1/$$me/avatar_hash' },
    //             $ref: 'defs.json#/definitions/avatar_hash'
    //         }
    //     }
    // },
    password: {
      properties: {
        origin_password: {
          $ref: "defs.json#/definitions/password",
          checkOriginPassword: true,
        },
        password_again: {
          $ref: "defs.json#/definitions/password_again",
        },
      },
    },
  },
  dependentRequired: {
    origin_password: ["password", "password_again"],
    password: ["origin_password", "password_again"],
    password_again: ["origin_password", "password"],
    // avatar: ["avarar_hash"],
    // avatar_hash: ["avarar"],
  },
  required: ["$$me"],
  errorMessage: {
    ...COMMON_ERR_MSG,
    minProperties: "至少需改1筆資料",
    dependentRequired: "必須有值",
  },
};
*/
// ajv.addSchema(DEF);

module.exports = (type) => {
  let id = `${CONS.URL}/${type}.json`;
  let validate = ajv.getSchema(id);
  return handle_error.bind(validate);
};
