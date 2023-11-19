import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.BLOG.ref,
  type: "object",
  minProperties: 2,
  properties: {
    $$blog: {
      type: "object",
      errorMessage: {
        type: "$$blog需是object",
      },
    },
    title: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/title`,
      diff: { $data: "1/$$blog/title" },
    },
    html: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/html`,
      diff: { $data: "1/$$blog/html" },
    },
    show: {
      type: "boolean",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/show`,
      diff: { $data: "1/$$blog/show" },
    },
    cancelImgs: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/cancelImgs`,
    },
  },
  required: ["$$blog"],
  _notEmpty: ["$$blog"],
  errorMessage: {
    minProperties: "至少需改一筆資料",
  },
};
