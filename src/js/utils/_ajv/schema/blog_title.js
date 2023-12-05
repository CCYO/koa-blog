import CONSTANT from "../../../../../config/constant";

let AJV = CONSTANT.AJV;
const TYPE = AJV.TYPE;

export default {
  $id: TYPE.BLOG_TITLE.ref,
  type: "object",
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
    additionalProperties: "多了額外數據",
  },
};
