import CONSTANT from "../../../../../config/constant";

const AJV = CONSTANT.AJV;
const $id = AJV.ref("BLOG");
const ref_def = AJV.ref("DEFAULT");

export default {
  $id,
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
      $ref: `${ref_def}#/definitions/title`,
      diff: { $data: "1/$$blog/title" },
    },
    html: {
      $ref: `${ref_def}#/definitions/html`,
      diff: { $data: "1/$$blog/html" },
    },
    show: {
      $ref: `${ref_def}#/definitions/show`,
      diff: { $data: "1/$$blog/show" },
    },
    cancelImgs: {
      $ref: `${ref_def}#/definitions/cancelImgs`,
    },
  },
  required: ["$$blog"],
  errorMessage: {
    required: "必需有值",
    minProperties: "至少需改一筆資料",
  },
};
