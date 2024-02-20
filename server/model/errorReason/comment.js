const CREATE = {
  ERR: { errno: 10123, msg: "COMMENT 創建失敗" },
};
const REMOVE = {
  ERR: { errno: 801, msg: "刪除 COMMENT 失敗" },
};
const READ = {
  NOT_EXIST: { errno: 50003, msg: "不存在任何相符的 Comment" },
};

module.exports = {
  READ,
  CREATE,
};
