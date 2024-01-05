import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.LOGIN.ref,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/email`,
    },
    password: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/password`,
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
