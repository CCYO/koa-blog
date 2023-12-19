import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.IMG_ALT.ref,
  type: "object",
  properties: {
    _old: {
      type: "object",
      errorMessage: {
        type: "_old需是object",
      },
    },
    alt: {
      type: "string",
      $ref: `${TYPE.DEFAULT.ref}#/definitions/blogImgAlt`,
    },
    blog_id: {
      type: "integer",
      minimum: 1,
      errorMessage: {
        type: "必須是整數",
        minimum: "必須 > 0",
      },
    },
    alt_id: {
      type: "integer",
      minimum: 1,
      errorMessage: {
        type: "必須是整數",
        minimum: "必須 > 0",
      },
    },
  },
  _notEmpty: ["alt", "blog_id", "alt_id"],
  _notRepeat: ["alt"],
  minProperties: 2,
  additionalProperties: false,
  errorMessage: {
    minProperties: "至少需改一筆資料",
    additionalProperties: "多了",
    type: "必須是object",
  },
};
