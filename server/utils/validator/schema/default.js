const { URL } = require("../config");

module.exports = {
  $id: `${URL}/defs.json`,
  definitions: {
    email: {
      type: "string",
      format: "email",
      noSpace: true,
      errorMessage: {
        type: "信箱資料必須是字符串",
        format: "信箱資料必須是電子信箱格式",
      },
    },
    nickname: {
      type: "string",
      noSpace: true,
      pattern: "^[\\u4e00-\\u9fa5a-zA-Z\\d]+$",
      minLength: 2,
      maxLength: 20,
      errorMessage: {
        type: "暱稱必須是字符串",
        pattern: "暱稱必須是英文、數字以及底線組成",
        minLength: "暱稱必須小於2個字符",
        maxLength: "暱稱必須小於20個字符",
      },
    },
    password: {
      type: "string",
      noSpace: true,
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
      errorMessage: {
        type: "必須是字符串",
        const: "請再次確認密碼是否相同",
      },
    },
    age: {
      type: "number",
      minimum: 1,
      maximum: 120,
      errorMessage: {
        type: "必須是number",
        minimum: "必需介於1-120之間",
        maximum: "必需介於1-120之間",
      },
    },
    avatar: {
      type: "string",
      format: "url",
      errorMessage: {
        type: "必須是string",
        format: "資料需符合url格式",
      },
    },
    avatar_hash: {
      type: "string",
      noSpace: true,
      errorMessage: {
        type: "必須是字符串",
      },
    },
  },
};
