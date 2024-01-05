const { TYPE, URL } = require("../config");

module.exports = {
  $id: `${URL}/${TYPE.SETTING}.json`,
  type: "object",
  // $async: true,
  minProperties: 2,
  properties: {
    _origin: {
      type: "object",
      errorMessage: {
        type: "_origin需是object",
      },
    },
    email: {
      // diff: { $data: "1/$$me/email" },
      $ref: "defs.json#/definitions/email",
    },
    age: {
      // diff: { $data: "1/$$me/age" },
      $ref: "defs.json#/definitions/age",
    },
    nickname: {
      // diff: { $data: "1/$$me/nickname" },
      $ref: "defs.json#/definitions/nickname",
    },
    avatar: {
      $ref: "defs.json#/definitions/avatar",
    },
    avatar_hash: {
      $ref: "defs.json#/definitions/avatar_hash",
    },
    origin_password: {
      $ref: "defs.json#/definitions/password",
    },
    password: {
      $ref: "defs.json#/definitions/password",
    },
    password_again: {
      $ref: "defs.json#/definitions/password_again",
    },
  },
  _notOrigin: ["email", "age", "nickname", "avatar", "avatar_hash"],
  dependentRequired: {
    origin_password: ["password", "password_again"],
    password: ["origin_password", "password_again"],
    password_again: ["origin_password", "password"],
    avatar: ["avatar_hash"],
    avatar_hash: ["avatar"],
  },
  required: ["_origin"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
    minProperties: "至少需改1筆資料",
    dependentRequired: "必須有值",
  },
};
