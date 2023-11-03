import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.LOGIN.ref,
  type: "object",
  properties: {
    email: { $ref: `${TYPE.DEFAULT.ref}#/definitions/email` },
    password: { $ref: `${TYPE.DEFAULT.ref}#/definitions/password` },
  },
  required: ["email", "password"],
  errorMessage: {
    required: "必填",
  },
};
