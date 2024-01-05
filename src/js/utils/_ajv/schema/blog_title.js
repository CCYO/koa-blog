import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.BLOG_TITLE.ref,
  type: "object",
  properties: {
    title: {
      type: "string",
      $ref: `${AJV_CONFIG.TYPE.DEFAULT.ref}#/definitions/title`,
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
