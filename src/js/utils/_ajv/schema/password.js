import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.PASSWORD.ref,
  $async: true,
  type: "object",
  properties: {
    origin_password: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
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

let x = {
  $id: TYPE.PASSWORD.ref,
  $async: true,
  type: "object",
  if: {
    properties: {
      origin_password: {
        type: "string",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
      },
    },
    required: ["origin_password"],
    _notEmpty: ["origin_password"],
  },
  then: {
    properties: {
      origin_password: {
        type: "string",
        confirmPassword: true,
      },
    },
    _notRepeat: ["origin_password"],
  },
  else: {
    $ref: "#/if",
  },
};
