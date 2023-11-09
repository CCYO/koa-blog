import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.PASSWORD.ref,
  $async: true,
  type: "object",
  if: {
    properties: {
      origin_password: {
        $ref: `${TYPE.DEFAULT.ref}#/definitions/password`,
      },
    },
    _required: ["origin_password"],
  },
  then: {
    properties: {
      origin_password: {
        confirmPassword: true,
      },
    },
    _required: ["origin_password"],
  },
  else: {
    $ref: "#/if",
  },
};
