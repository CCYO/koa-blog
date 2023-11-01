import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("AVATAR");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
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
      $ref: `${ref_def}#/definitions/avatar_hash`,
    },
  },
  required: ["avatar_base64", "avatar_hash"],
  errorMessage: {
    required: "必填",
  },
};
