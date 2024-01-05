import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.SETTING.ref,
  type: "object",
  $async: true,
  minProperties: 2,
  allOf: [
    {
      properties: {
        _old: {
          type: "object",
          errorMessage: {
            type: "_old需是object",
          },
        },
      },
    },
    {
      properties: {
        email: {
          $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/email`,
        },
        age: {
          $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/age`,
        },
        nickname: {
          $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/nickname`,
        },
        password: {
          $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/password`,
        },
        password_again: {
          $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/password_again`,
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

        // _notRepeat: ["email", "age", "nickname", "password", "avatar_hash"],
        // _noSpace: [
        //   "email",
        //   "age",
        //   "nickname",
        //   "password",
        //   "avatar_hash",
        //   "avatar_ext",
        // ],
        // required: ["_old"],
        // dependentRequired: {
        //   password: ["password_again", "origin_password"],
        //   password_again: ["password", "origin_password"],
        //   avatar_hash: ["avatar_ext"],
        //   avatar_ext: ["avatar_hash"],
        // },
        // errorMessage: {
        //   minProperties: "至少需改一筆資料",
        //   dependentRequired: "必填",
        // },
      },
    },
    {
      if: {
        properties: {
          email: {
            type: "string",
            $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/email`,
          },
        },
        // _notRepeat: ["email"],
        // _noSpace: ["email"],
      },
      then: {
        properties: {
          email: {
            type: "string",
            _isEmailExist: true,
          },
        },
      },
      else: {
        properties: {
          email: {
            type: "string",
            $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/email`,
          },
        },
      },
    },
  ],
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
    required: "setting 校驗時，必須擁有_old",
    type: "驗證數據必須是 object 格式",
    minProperties: "至少需改一筆資料",
    dependentRequired: "必填",
  },
};
