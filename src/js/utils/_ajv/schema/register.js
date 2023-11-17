import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.REGISTER.ref,
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
    password_again: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again`,
    },
  },
  additionalProperties: false,
  required: ["email", "password", "password_again"],
  _notEmpty: ["email", "password", "password_again"],
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
