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
      errorMessage: {
        type: "必須是字符串",
      },
    },
    avatar_ext: {
      type: "string",
      pattern: "^(PNG)$|^(JPG)$",
      errorMessage: {
        type: "必須是字符串",
        pattern: "必須是jpg或png類型",
      },
    },
  },
  _notRepeat: ["email", "age", "nickname", "password", "avatar_hash"],
  _noSpace: [
    "email",
    "age",
    "nickname",
    "password",
    "avatar_hash",
    "avatar_ext",
  ],
  required: ["_old"],
  dependentRequired: {
    password: ["password_again", "origin_password"],
    password_again: ["password", "origin_password"],
    avatar_hash: ["avatar_ext"],
    avatar_ext: ["avatar_hash"],
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
