import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.PASSOWRD_AGAIN.ref,
  type: "object",
  properties: {
    password: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
    },
    password_again: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again`,
    },
  },
  _required: ["password", "password_again"],
  additionalProperties: false,
  errorMessage: {
    type: "必須是object",
    additionalProperties: "屬於非法數據",
  },
};
