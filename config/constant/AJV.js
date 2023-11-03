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
  API: {
    EMAIL: "/api/user/isEmailExist",
    PASSWORD: "/api/)user/confirmPassword",
  },
};

AJV.ref = (key) => `${this.host}/${this.TYPE[key]}.json`;

module.exports = AJV;
