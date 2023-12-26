const HOST = "http://my_ajv";

class Ajv_type extends String {
  constructor(string) {
    super(string);
    this.ref = `${HOST}/${string}.json`;
    this.key = string;
  }
}

const AJV = {
  HOST,
  TYPE: {
    AVATAR: new Ajv_type("avatar"),
    BLOG: new Ajv_type("blog"),
    BLOG_TITLE: new Ajv_type("blog_title"),
    DEFAULT: new Ajv_type("default"),

    IS_EMAIL_EXIST: new Ajv_type("is_email_exist"),
    EMAIL: new Ajv_type("email"),
    REGISTER: new Ajv_type("register"),
    LOGIN: new Ajv_type("login"),
    PASSWORD: new Ajv_type("password"),

    SETTING: new Ajv_type("setting"),

    IMG_ALT: new Ajv_type("alt"),
    PASSOWRD_AGAIN: new Ajv_type("password_again"),
  },
  //  參考 https://ajv.js.org/api.html#error-parameters
  ERROR_PARAMS: {
    required: "missingProperty",
    dependentRequired: "missingProperty",
    additionalProperties: "additionalProperty",
    // _required: "_missingProperty",
    _notEmpty: "_notEmpty",
    _notRepeat: "_notRepeat",
    _noSpace: "noSpace",
  },
  FIELD_NAME: {
    TOP: "all",
  },
  EN_TO_TW: {
    //	全局錯誤
    all: "all",
    //	register
    email: "信箱",
    password: "密碼",
    password_again: "密碼確認",
    //	blog
    title: "文章標題",
    contetn: "文章內文",
    show: "文章狀態",
    //	setting
    nickname: "暱稱",
    age: "年齡",
    avatar: "頭像",
    avatar_hash: "頭像hash",
    // myKeyword
    confirm_password: "密碼驗證",
  },
};

module.exports = AJV;
