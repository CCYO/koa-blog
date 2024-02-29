/**
 * @description 加密
 */
const crypto = require("crypto");
//  針對STR MD5加密
const hash = (data) => {
  const md5 = crypto.createHash("md5");
  return md5.update(data).digest("hex");
};
//  針對OBJ MD5加密
const hash_obj = (obj) => {
  return hash(JSON.stringify(obj));
};

module.exports = {
  hash,
  hash_obj,
};
