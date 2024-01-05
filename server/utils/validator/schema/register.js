const { TYPE, URL } = require("../config");

module.exports = {
  $id: `${URL}/${TYPE.REGISTER}.json`,
  $async: true,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: "defs.json#/definitions/email",
      isEmailExist: true,
    },
    password: {
      type: "string",
      $ref: "defs.json#/definitions/password",
    },
    password_again: {
      type: "string",
      $ref: "defs.json#/definitions/password_again",
    },
  },
  required: ["email", "password", "password_again"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
