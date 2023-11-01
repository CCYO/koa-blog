import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("REGISTER");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
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
          $ref: `${ref_def}#/definitions/email`,
        },
        age: {
          noSpace: true,
          diff: { $data: "1/$$me/age" },
          $ref: `${ref_def}#/definitions/age`,
        },
        nickname: {
          noSpace: true,
          diff: { $data: "1/$$me/nickname" },
          $ref: `${ref_def}#/definitions/nickname`,
        },
        password: {
          noSpace: true,
          diff: { $data: "1/$$me/password" },
          $ref: `${ref_def}#/definitions/password`,
        },
        avatar_hash: {
          diff: { $data: "1/$$me/avatar_hash" },
          $ref: `${ref_def}#/definitions/avatar_hash`,
        },
      },
      required: ["$$me"],
      errorMessage: {
        required: "必需有值",
        minProperties: "至少需改一筆資料",
      },
    },
    {
      properties: {
        password: {
          $ref: `${ref_def}#/definitions/password`,
          diff: { $data: "1/$$me/origin_password" },
        },
        password_again: { $ref: `${ref_def}#/definitions/password_again` },
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
