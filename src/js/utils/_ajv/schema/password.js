import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("PASSWORD");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
  $async: true,
  type: "object",
  if: {
    properties: {
      origin_password: {
        $ref: `${ref_def}#/definitions/password`,
      },
    },
    required: ["origin_password"],
  },
  then: {
    properties: {
      origin_password: {
        confirmPassword: true,
      },
    },
    required: ["origin_password"],
  },
  else: {
    $ref: "#/if",
  },
  errorMessage: {
    required: "必填",
  },
};
