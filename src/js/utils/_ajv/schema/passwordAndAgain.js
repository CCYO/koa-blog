import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.PASSOWRD_AGAIN.ref,
  type: "object",
  properties: {
    password: { $ref: `${TYPE.DEFAULT.ref}#/definitions/password` },
    password_again: {
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again`,
    },
  },
  required: ["password", "password_again"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    required: "必填",
    additionalProperties: "屬於非法數據",
  },
};
