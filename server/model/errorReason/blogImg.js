const REMOVE = {
  ERR: { errno: 801, msg: "刪除 BlogImg 失敗" },
  ROW: { errno: 40003, msg: "刪除 BlogImg 的數量不完全" },
};
const READ = {
  NO_ARGS: { errno: 1112, msg: "沒有提供相符的參數" },
  NOT_EXIST: { errno: 1111, msg: "沒有相符的 BlogImg" },
  NO_BLOG_IMG_ALT: { errno: 1001, msg: "沒有相應對的 blogImgAlt" },
};
module.exports = {
  READ,
  REMOVE,
};
