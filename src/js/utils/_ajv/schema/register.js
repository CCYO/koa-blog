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
      _required: true,
    },
    password: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
      _required: true,
    },
    password_again: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again`,
      _required: true,
    },
  },
  required: ["email", "password", "password_again"],
  errorMessage: {
    type: "必須是object",
    required: "必填",
  },
};
