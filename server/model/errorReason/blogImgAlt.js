const CREATE = {
  ERR: { errno: 50001, msg: "BlogImgAlt創建失敗" },
};
const READ = {
  NOT_BLOG: { errno: 1005, msg: "不屬於該Blog" },
  NOT_AUTHOR: { errno: 1005, msg: "非作者本人" },
  NOT_EXIST: { errno: 50003, msg: "不存在任何相符的 BlogImgAlt" },
};
const REMOVE = {
  ERR: { errno: 801, msg: "刪除 BlogImgAlt 失敗" },
  ROW: { errno: 40003, msg: "刪除 BlogImgAlt 的數量不完全" },
};
module.exports = {
  REMOVE,
  READ,
  CREATE,
};
