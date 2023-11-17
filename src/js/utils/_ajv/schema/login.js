import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.LOGIN.ref,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/email`,
    },
    password: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
    },
  },
  required: ["email", "password"],
  _notEmpty: ["email", "password"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
