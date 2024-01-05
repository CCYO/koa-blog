import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.IS_EMAIL_EXIST.ref,
  $async: true,
  if: {
    type: "object",
    properties: {
      email: {
        type: "string",
        $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/email`,
      },
    },
    _notEmpty: ["email"],
    required: ["email"],
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
  },
  then: {
    type: "object",
    properties: {
      email: {
        type: "string",
        _isEmailExist: true,
      },
    },
  },
  else: {
    $ref: "#/if",
  },
};
