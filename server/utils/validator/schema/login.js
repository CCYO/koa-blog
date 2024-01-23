const { TYPE, URL } = require("../config");

module.exports = {
  $id: `${URL}/${TYPE.LOGIN}.json`,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: "user.json#/definitions/email",
    },
    password: {
      type: "string",
      $ref: "user.json#/definitions/password",
    },
  },
  required: ["email", "password"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
