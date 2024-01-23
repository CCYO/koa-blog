const { TYPE, URL } = require("../config");

module.exports = {
  $id: `${URL}/${TYPE.EMAIL}.json`,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: "user.json#/definitions/email",
    },
  },
  required: ["email"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
