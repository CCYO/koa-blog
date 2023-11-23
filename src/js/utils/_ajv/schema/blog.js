import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.BLOG.ref,
  type: "object",
  if: {
    minProperties: 2,
    properties: {
      _old: {
        type: "object",
        errorMessage: {
          type: "_old需是object",
        },
      },
      title: {
        type: "string",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/title`,
      },
      html: {
        type: "string",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/html`,
      },
      show: {
        type: "boolean",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/show`,
      },
      cancelImgs: {
        type: "string",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/cancelImgs`,
      },
    },
    _notRepeat: ["title", "html", "show"],
    _notEmpty: ["title"],
  },
  else: {
    properties: {
      title: {
        type: "string",
        $ref: `${TYPE.DEFAULT.ref}#/definitions/title`,
      },
    },
    required: ["title"],
    _notEmpty: ["title"],
    additionalProperties: false,
    errorMessage: {
      required: "少傳了某些數據",
      minProperties: "至少需改一筆資料",
      additionalProperties: "多了額外數據",
    },
  },
  errorMessage: {
    required: "少傳了某些數據",
    minProperties: "至少需改一筆資料",
    additionalProperties: "多了",
  },
};

/*
export default {
  $id: TYPE.BLOG.ref,
  type: "object",
  minProperties: 2,
  properties: {
    _old: {
      type: "object",
      errorMessage: {
        type: "_old需是object",
      },
    },
    title: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/title`,
      // diff: { $data: "1/$$blog/title" },
    },
    html: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/html`,
      // diff: { $data: "1/$$blog/html" },
    },
    show: {
      type: "boolean",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/show`,
      // diff: { $data: "1/$$blog/show" },
    },
    cancelImgs: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/cancelImgs`,
    },
  },
  _notRepeat: ["title", "html", "show"],
  _notEmpty: ["title"],
  errorMessage: {
    minProperties: "至少需改一筆資料",
  },
};
*/
