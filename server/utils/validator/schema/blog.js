const { DEFAULT } = require("../../../config");
const { URL } = require("../config");

module.exports = {
  $id: `${URL}/blog.json`,
  definitions: {
    title: {
      type: "string",
      maxLength: 20,
      minLength: 1,
      errorMessage: {
        type: "必須是字符串",
        maxLength: "長度需小於20個字",
        minLength: "長度需大於1個字",
      },
    },
    html: {
      type: "string",
      maxLength: DEFAULT.BLOG.EDITOR.HTML_MAX_LENGTH,
      minLength: DEFAULT.BLOG.EDITOR.HTML_MIN_LENGTH,
      errorMessage: {
        type: "必須是字符串",
        maxLength: "長度需小於65536個字",
        minLength: "長度需大於1個字",
      },
    },
    show: {
      type: "boolean",
      errorMessage: {
        type: "必須是boolean",
      },
    },
    cancelImgs: {
      type: "array",
      items: {
        $ref: `#/definitions/cancelImgItem`,
      },
    },
    cancelImgItem: {
      type: "object",
      properties: {
        blogImg_id: {
          type: "integer",
          errorMessage: {
            type: "只能是整數",
          },
        },
        blogImgAlt_list: {
          type: "array",
          minItems: 1,
          uniqueItems: true,
          items: {
            type: "integer",
            errorMessage: {
              type: "只能是整數",
            },
          },
          errorMessage: {
            type: "必須是array",
            minItems: "不能為空",
            uniqueItems: "不該有重複的值",
          },
        },
      },
      required: ["blogImg_id", "blogImgAlt_list"],
      _notEmpty: ["blogImg_id", "blogImgAlt_list"],
      additionalProperties: false,
      errorMessage: {
        type: "必須是object",
        additionalProperties: "不允許除了blogImg_id與blogImgAlt_list以外的數據",
      },
    },
  },
};
