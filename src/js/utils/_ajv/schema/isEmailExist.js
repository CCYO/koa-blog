import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("IS_EMAIL_EXIST");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
  $async: true,
  type: "object",
  if: {
    properties: {
      email: { $ref: `${ref_def}#/definitions/email` },
    },
    required: ["email"],
    additionalProperties: false,
  },
  then: {
    properties: {
      email: {
        type: "string",
        isEmailExist: true,
      },
    },
  },
  else: {
    $ref: "#/if",
  },
  errorMessage: {
    type: "必須是object",
    required: "必填",
    additionalProperties: "屬於非法數據",
  },
};
