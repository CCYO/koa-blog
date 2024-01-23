module.exports = {
  HOST: "http://my_ajv",
  TYPE: {
    EMAIL: "email",
    REGISTER: "register",
    LOGIN: "login",
    SETTING: "setting",
    BLOG_UPDATE: "blog_update",
  },
  ERROR_PARAMS: {
    required: "missingProperty",
    dependentRequired: "missingProperty",
    additionalProperties: "additionalProperty",
    // _required: "_missingProperty",
    // _notEmpty: "_notEmpty",
    // _notRepeat: "_notRepeat",
    _noSpace: "_noSpace",
    _notOrigin: "_noOrigin",
  },
  FIELD_NAME: {
    TOP: "all",
  },
};
