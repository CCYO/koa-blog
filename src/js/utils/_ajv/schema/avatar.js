import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.AVATAR.ref,
  type: "object",
  properties: {
    avatar_base64: {
      type: "string",
      format: "byte",
      errorMessage: {
        format: "非base64編碼",
      },
    },
    avatar_hash: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/avatar_hash`,
    },
  },
  required: ["avatar_base64", "avatar_hash"],
  _notEmpty: ["avatar_base64", "avatar_hash"],
  _notRepeat: ["avatar_hash"],
};
