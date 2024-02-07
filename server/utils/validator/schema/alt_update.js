const { TYPE, URL } = require("../config");

module.exports = {
  $id: `${URL}/${TYPE.ALT_UPDATE}.json`,
  type: "object",
  properties: {
    _origin: {
      type: "object",
      errorMessage: {
        type: "_origin需是object",
      },
    },
    blog_id: {
      type: "integer",
      errorMessage: {
        type: "blog_id必須是整數",
      },
    },
    alt_id: {
      type: "integer",
      errorMessage: {
        type: "blog_id必須是整數",
      },
    },
    alt: {
      type: "string",
      minLength: 1,
      maxLength: 20,
      pattern: "^[\\u4e00-\\u9fa5a-zA-Z\\d\\-]+$",
      errorMessage: {
        type: "必須是字符串",
        pattern: "必須由中文、英文、數字以及底線與連接線組成",
        minLength: "長度要1個字符以上",
        maxLength: "長度需小於20個字",
      },
    },
  },
  _notOrigin: ["alt"],
  _noSpace: ["alt"],
  required: ["_origin", "blog_id", "alt", "alt_id"],
  additionalProperties: false,
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    additionalProperties: "不允許除了_origin、blog_id、alt_id、alt以外的數據",
  },
};
