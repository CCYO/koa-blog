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
    },
    password: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
    },
  },
  _required: ["email", "password"],
};
