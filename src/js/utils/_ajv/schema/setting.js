import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.SETTING.ref,
  type: "object",
  allOf: [
    {
      minProperties: 2,
      properties: {
        $$me: {
          type: "object",
          errorMessage: {
            type: "$$me需是object",
          },
        },
        email: {
          noSpace: true,
          diff: { $data: "1/$$me/email" },
          $ref: `${TYPE.DEFAULT.ref}#/definitions/email`,
        },
        age: {
          noSpace: true,
          diff: { $data: "1/$$me/age" },
          $ref: `${TYPE.DEFAULT.ref}#/definitions/age`,
        },
        nickname: {
          noSpace: true,
          diff: { $data: "1/$$me/nickname" },
          $ref: `${TYPE.DEFAULT.ref}#/definitions/nickname`,
        },
        password: {
          noSpace: true,
          diff: { $data: "1/$$me/password" },
          $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
        },
        avatar_hash: {
          diff: { $data: "1/$$me/avatar_hash" },
          $ref: `${TYPE.DEFAULT.ref}#/definitions/avatar_hash`,
        },
      },
      _required: ["$$me"],
      errorMessage: {
        minProperties: "至少需改一筆資料",
      },
    },
    {
      properties: {
        password: {
          $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
          diff: { $data: "1/$$me/origin_password" },
        },
        password_again: {
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
};
