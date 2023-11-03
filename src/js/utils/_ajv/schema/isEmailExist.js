import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.IS_EMAIL_EXIST.ref,
  $async: true,
  type: "object",
  if: {
    properties: {
      email: { $ref: `${TYPE.DEFAULT.ref}#/definitions/email` },
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
