import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.IMG_ALT.ref,
  type: "object",
  properties: {
    $$alt: {
      type: "string",
      errorMessage: {
        type: "$$alt 必須是 string",
      },
    },
    alt: {
      $ref: `${TYPE.DEFAULT.ref}#/definitions/blogImgAlt`,
      diff: { $data: "1/$$alt" },
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
  required: ["$$alt", "alt", "blog_id", "alt_id"],
  errorMessage: {
    type: "必須是object",
    require: "必需有值",
  },
};
