import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.REGISTER.ref,
  type: "object",
  properties: {
    email: {
      $ref: `${TYPE.DEFAULT.ref}#/definitions/email`,
    },
    password: { $ref: `${TYPE.DEFAULT.ref}#/definitions/password` },
    password_again: { $ref: `${TYPE.DEFAULT.ref}#/definitions/password_again` },
  },
  required: ["email", "password", "password_again"],
  errorMessage: {
    type: "必須是object",
    required: "必填",
  },
};
