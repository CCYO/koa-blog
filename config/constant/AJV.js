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
    additionalProperties: "additionalProperty",
    // dependentRequired: 'missingProperty' 目前schema都沒用到
  },
  FIELD_NAME: {
    TOP: "all",
  },
};

module.exports = AJV;
