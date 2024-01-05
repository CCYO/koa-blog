import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.PASSOWRD_AGAIN.ref,
  type: "object",
  properties: {
    password: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/password`,
    },
    password_again: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/password_again`,
    },
  },
  required: ["password", "password_again"],
  _notEmpty: ["password", "password_again"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
