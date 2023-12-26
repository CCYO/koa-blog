import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.SETTING.ref,
  type: "object",
  /*
  allOf: [
    {
      */
  minProperties: 2,
  properties: {
    _old: {
      type: "object",
      errorMessage: {
        type: "_old需是object",
      },
    },
    email: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/email`,
    },
    age: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/age`,
    },
    nickname: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/nickname`,
    },
    password: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
    },
    password_again: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again`,
    },
    avatar_hash: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/avatar_hash`,
    },
  },
  _notRepeat: ["email", "age", "nickname", "password", "avatar_hash"],
  _noSpace: ["email", "age", "nickname", "password"],
  required: ["_old"],
  dependentRequired: {
    password: ["password_again", "origin_password"],
    password_again: ["password", "origin_password"],
  },
  errorMessage: {
    minProperties: "至少需改一筆資料",
    dependentRequired: "必填",
  },
  /*
    },
    {
      properties: {
        password: {
          type: "string",
          $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
        },
        password_again: {
          type: "string",
          $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again`,
        },
      },
      dependentRequired: {
        password: ["password_again", "origin_password"],
        password_again: ["password", "origin_password"],
      },
      errorMessage: {
        dependentRequired: "必填",
      },
    },
    
  ],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
  },
*/
};
