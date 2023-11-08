import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.IS_EMAIL_EXIST.ref,
  $async: true,
  if: {
    type: "object",
    properties: {
      email: {
        type: "string",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/email`,
        _required: true,
      },
    },
    required: ["email"],
  },
  then: {
    type: "object",
    properties: {
      email: {
        type: "string",
        isEmailExist: true,
      },
    },
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
    },
  },
  else: {
    $ref: "#/if",
  },
  errorMessage: {
    type: "必須是object",
    required: "必填",
  },
};
