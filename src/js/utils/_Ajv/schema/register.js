import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("REGISTER");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
  type: "object",
  properties: {
    email: {
      $ref: `${AJV.TYPE.DEFAULT}#/definitions/email`,
    },
    password: { $ref: `${ref_def}#/definitions/password` },
    password_again: { $ref: `${ref_def}#/definitions/password_again` },
  },
  required: ["email", "password", "password_again"],
  errorMessage: {
    type: "必須是object",
    required: "必填",
  },
};
