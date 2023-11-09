import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.AVATAR.ref,
  type: "object",
  properties: {
    avatar_base64: {
      format: "byte",
      errorMessage: {
        format: "非base64編碼",
      },
    },
    avatar_hash: {
      diff: { $data: "1/$$me/avatar_hash" },
      $ref: `${TYPE.DEFAULT.ref}#/definitions/avatar_hash`,
    },
  },
  _required: ["avatar_base64", "avatar_hash"],
};
