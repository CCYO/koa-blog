/**
 * @description Model api相關
 */
const { extend } = require("lodash");
let { ENV } = require("../config");
const ErrRes = require("./errRes"); //  0404
//  0404
class _Model {
  constructor({
    errno = 0,
    msg = undefined,
    data = undefined,
    cache = undefined,
  }) {
    this.errno = errno;
    if (msg) this.msg = msg;
    if (data) this.data = data;
    if (cache) this.cache = cache;
  }
}
//  0404
class SuccModel extends _Model {
  constructor(obj = { data: undefined, cache: undefined }) {
    super(obj);
  }
}
//  0404
class ErrModel extends _Model {
  constructor({ errno, msg, data, cache }) {
    super({ errno, msg, data, cache });
  }
}
//  0404
class MyErr extends Error {
  // isMyErr = true;
  constructor({ errno, msg, error }) {
    super(error);
    // let serverError = undefined;
    this.model = {
      errno,
      msg,
    };
    this.serverError = error;
  }
}
module.exports = {
  ErrRes,
  SuccModel,
  ErrModel,
  MyErr,
};
