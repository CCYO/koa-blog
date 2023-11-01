import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("PASSWORD_AGAIN");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
  type: "object",
  properties: {
    password: { $ref: `${ref_def}#/definitions/password` },
    password_again: {
      $ref: `${ref_def}#/definitions/password_again`,
    },
  },
  required: ["password", "password_again"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    required: "必填",
    additionalProperties: "屬於非法數據",
  },
};
