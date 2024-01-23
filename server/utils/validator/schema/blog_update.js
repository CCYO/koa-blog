const { TYPE, URL } = require("../config");

module.exports = {
  $id: `${URL}/${TYPE.BLOG_UPDATE}.json`,
  type: "object",
  minProperties: 2,
  properties: {
    _origin: {
      type: "object",
      errorMessage: {
        type: "_origin需是object",
      },
    },
    title: {
      $ref: "blog.json#/definitions/title",
    },
    html: {
      $ref: "blog.json#/definitions/html",
    },
    show: {
      $ref: "blog.json#/definitions/show",
    },
    cancelImgs: {
      $ref: "blog.json#/definitions/cancelImgs",
    },
  },
  _notOrigin: ["title", "html", "show"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    minProperties: "至少需改1筆資料",
  },
};
