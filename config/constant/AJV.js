const AJV = {
  HOST: "http://my_ajv",
  TYPE: {
    AVATAR: "avatar",
    BLOG: "blog",
    DEFAULT: "default",

    IS_EMAIL_EXIST: "is_email_exist",
    EMAIL: "email",
    REGISTER: "register",
    LOGIN: "login",
    PASSWORD: "password",

    SETTING: "setting",

    IMG_ALT: "alt",
    PASSOWRD_AGAIN: "password_again",
  },
  API: {
    EMAIL: "/api/user/isEmailExist",
    PASSWORD: "/api/user/confirmPassword",
  },
};

AJV.ref = (key) => `${this.host}/${this.TYPE[key]}.json`;

module.exports = AJV;
