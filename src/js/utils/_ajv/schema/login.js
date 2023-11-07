import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.LOGIN.ref,
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
  },
  required: ["email", "password"],
  errorMessage: {
    required: "必填",
  },
};
