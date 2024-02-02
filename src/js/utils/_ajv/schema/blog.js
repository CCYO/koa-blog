import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.BLOG.ref,
  type: "object",
  properties: {
    _old: {
      type: "object",
      errorMessage: {
        type: "_old需是object",
      },
    },
    title: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/title`,
    },
    html: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/html`,
    },
    show: {
      type: "boolean",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/show`,
    },
    cancelImgs: {
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/cancelImgs`,
    },
  },
  _notRepeat: ["title", "html", "show"],
  _notEmpty: ["title"],
  minProperties: 2,
  additionalProperties: false,
  errorMessage: {
    minProperties: "至少需改一筆資料",
    additionalProperties: "多了",
  },
};
