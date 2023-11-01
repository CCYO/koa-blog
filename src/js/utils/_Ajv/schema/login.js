import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("PASSWORD");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
  type: "object",
  properties: {
    email: { $ref: `${ref_def}#/definitions/email` },
    password: { $ref: `${ref_def}#/definitions/password` },
  },
  required: ["email", "password"],
  errorMessage: {
    required: "必填",
  },
};
