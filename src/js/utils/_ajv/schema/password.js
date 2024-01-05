import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.PASSWORD.ref,
  $async: true,
  type: "object",
  properties: {
    origin_password: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/password`,
    },
  },
  required: ["origin_password"],
  _notEmpty: ["origin_password"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
    required: "缺少此數據",
  },
};
