import DEFAULT from "../../../../../server/config/default";
import AJV_CONFIG from "../config";

export default {
  $id: AJV_CONFIG.TYPE.DEFAULT.ref,
  definitions: {
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
    email: {
      type: "string",
      format: "email",
      minLength: 1,
      errorMessage: {
        type: "必須是字符串",
        format: "必須是電子信箱格式",
        minLength: "不可為空",
      },
    },
    nickname: {
      type: "string",
      pattern: "^[\\u4e00-\\u9fa5a-zA-Z\\d]+$",
      minLength: 1,
      maxLength: 20,
      errorMessage: {
        type: "必須是字符串",
        pattern: "必須由中文、英文、數字以及底線組成",
        minLength: "不可為空",
        maxLength: "長度需小於20個字",
      },
    },
    origin_password: {
      type: "string",
      pattern: "^[\\w]+$",
      minLength: 6,
      maxLength: 32,
      errorMessage: {
        type: "必須是字符串",
        pattern: "必須由英文、數字以及底線組成",
        minLength: "長度須介於6-32個字符",
        maxLength: "長度須介於6-32個字符",
      },
    },
    password: {
      type: "string",
      pattern: "^[\\w]+$",
      minLength: 6,
      maxLength: 32,
      errorMessage: {
        type: "必須是字符串",
        pattern: "必須由英文、數字以及底線組成",
        minLength: "長度須介於6-32個字符",
        maxLength: "長度須介於6-32個字符",
      },
    },
    password_again: {
      type: "string",
      const: {
        $data: "1/password",
      },
      pattern: "^[\\w]+$",
      minLength: 6,
      maxLength: 32,
      errorMessage: {
        type: "必須是字符串",
        const: "請再次確認密碼是否相同",
        pattern: "必須由英文、數字以及底線組成",
        minLength: "長度須介於6-32個字符",
        maxLength: "長度須介於6-32個字符",
      },
    },
    age: {
      type: "number",
      minimum: 1,
      maximum: 120,
      errorMessage: {
        type: "必須是數字",
        minimum: "必需介於1-120之間",
        maximum: "必需介於1-120之間",
      },
    },
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
    show: {
      type: "boolean",
      errorMessage: {
        type: "必須是boolean",
      },
    },
    cancelImgs: {
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
    blogImgAlt: {
      type: "string",
      minLength: 1,
      maxLength: 20,
      pattern: "^[\\u4e00-\\u9fa5a-zA-Z\\d]+$",
      errorMessage: {
        type: "必須是字符串",
        pattern: "必須由中文、英文、數字以及底線組成",
        minLength: "長度要1個字符以上",
        maxLength: "長度需小於20個字",
      },
    },
  },
};
